import { useEffect, useMemo, useRef, useState } from 'react'
import { Calculator, ImagePlus, Loader2, Plus, Trash2, Upload, X } from 'lucide-react'
import { calculatePriceBreakdown, money } from '../utils/commerce'

const empty = { id:0, sku:'', name:'', brand:'', category:'', subcategory:'', price:0, costPrice:0, stock:0, minStock:3, trackStock:true, autoPrice:true, pricingRules:[{id:1,name:'Ganancia',percent:40},{id:2,name:'Impuestos',percent:21}], size:'', active:true, featured:false, image:'', description:'' }

export default function ProductEditor({ product, data, onClose, onSave, onUploadImage }) {
  const defaults = { ...empty, brand:data.brands.find(x=>x.active)?.name || '', category:data.productCategories.find(x=>x.active)?.name || '' }
  const [form, setForm] = useState(product ? { ...defaults, ...product, pricingRules:product.pricingRules || [] } : defaults)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [saving, setSaving] = useState(false)
  const fileRef = useRef(null)
  useEffect(() => setForm(product ? { ...defaults, ...product, pricingRules:product.pricingRules || [] } : defaults), [product])

  const subs = useMemo(() => data.productCategories.find(x=>x.name===form.category)?.subcategories.filter(x=>x.active) || [], [data.productCategories, form.category])
  useEffect(() => { if (!subs.some(x=>x.name===form.subcategory)) setForm(current=>({ ...current, subcategory:subs[0]?.name || '' })) }, [form.category])

  const priceBreakdown = calculatePriceBreakdown(form.costPrice, form.pricingRules, data.settings?.priceRoundingStep || 500, data.settings?.priceRoundingMode || 'up')
  const suggested = priceBreakdown.roundedPrice
  const updateRule = (index, patch) => setForm(current => ({ ...current, pricingRules:current.pricingRules.map((r,i)=>i===index?{...r,...patch}:r) }))
  const removeRule = index => setForm(current => ({ ...current, pricingRules:current.pricingRules.filter((_,i)=>i!==index) }))
  const addRule = () => setForm(current => ({ ...current, pricingRules:[...current.pricingRules,{id:Date.now(),name:'Recargo',percent:0}] }))

  const chooseImage = async event => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setUploadError('')
    if (!['image/jpeg','image/png','image/webp'].includes(file.type)) { setUploadError('Usá una imagen JPG, PNG o WEBP.'); return }
    if (file.size > 8 * 1024 * 1024) { setUploadError('La imagen no puede superar los 8 MB.'); return }
    setUploading(true)
    try {
      const url = await onUploadImage(file)
      setForm(current => ({ ...current, image:url }))
    } catch (err) { setUploadError(err.message || 'No se pudo subir la imagen.') }
    finally { setUploading(false) }
  }

  const submit = async e => {
    e.preventDefault()
    if (uploading || saving) return
    setSaving(true)
    setUploadError('')
    try {
      await onSave({ ...form, costPrice:Number(form.costPrice), price:form.autoPrice?suggested:Number(form.price), stock:Number(form.stock), minStock:Number(form.minStock), pricingRules:form.pricingRules.map(r=>({...r,percent:Number(r.percent)})) })
    } catch (err) { setUploadError(err.message || 'No se pudo guardar el producto.') }
    finally { setSaving(false) }
  }

  return (
    <div className="modal-backdrop product-modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal modal-wide product-editor-modal">
        <div className="product-modal-header">
          <div><span className="section-kicker">{form.id?'Editar':'Nuevo'} producto</span><h2>{form.id?form.name:'Crear producto'}</h2></div>
          <button className="modal-close product-modal-close" type="button" onClick={onClose}><X size={20}/></button>
        </div>
        <form className="editor-form product-editor-form" onSubmit={submit}>
          <div className="product-modal-body">
            {uploadError && <div className="notice-error">{uploadError}</div>}
            <div className="product-image-editor">
              <button type="button" className="product-image-preview" onClick={()=>fileRef.current?.click()} disabled={uploading}>
                {form.image ? <img src={form.image} alt="Vista previa del producto"/> : <div><ImagePlus size={30}/><strong>Agregar imagen</strong><span>Elegí una foto desde la galería o cámara del dispositivo.</span></div>}
                {uploading && <span className="image-upload-overlay"><Loader2 className="spin" size={24}/> Subiendo…</span>}
              </button>
              <div className="product-image-controls">
                <button type="button" className="btn btn-secondary" onClick={()=>fileRef.current?.click()} disabled={uploading}><Upload size={16}/> {form.image?'Cambiar imagen':'Seleccionar imagen'}</button>
                {form.image && <button type="button" className="btn btn-secondary" onClick={()=>setForm({...form,image:''})}>Quitar</button>}
                <input ref={fileRef} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseImage}/>
                <label><span>O pegar URL manualmente</span><input type="url" value={form.image} onChange={e=>setForm({...form,image:e.target.value})} placeholder="https://..."/></label>
                <small className="field-hint">JPG, PNG o WEBP · máximo 8 MB. La imagen seleccionada se aloja mediante la API del backend.</small>
              </div>
            </div>

            <label><span>Nombre</span><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
            <div className="form-grid"><label><span>Marca</span><select required value={form.brand} onChange={e=>setForm({...form,brand:e.target.value})}><option value="">Seleccionar…</option>{data.brands.filter(x=>x.active).map(x=><option key={x.id}>{x.name}</option>)}</select></label><label><span>SKU</span><input required value={form.sku} onChange={e=>setForm({...form,sku:e.target.value})}/></label></div>
            <div className="form-grid"><label><span>Categoría</span><select required value={form.category} onChange={e=>setForm({...form,category:e.target.value})}><option value="">Seleccionar…</option>{data.productCategories.filter(x=>x.active).map(x=><option key={x.id}>{x.name}</option>)}</select></label><label><span>Subcategoría</span><select value={form.subcategory} onChange={e=>setForm({...form,subcategory:e.target.value})}><option value="">Sin subcategoría</option>{subs.map(x=><option key={x.id}>{x.name}</option>)}</select></label></div>

            <div className="pricing-box">
              <div className="pricing-box-head"><div><strong>Formación de precio</strong><small>Los porcentajes se aplican en orden sobre el subtotal anterior.</small></div><Calculator size={20}/></div>
              <div className="form-grid"><label><span>Costo actual</span><input inputMode="decimal" type="number" min="0" value={form.costPrice} onChange={e=>setForm({...form,costPrice:e.target.value})}/></label><label><span>Precio final manual</span><input inputMode="decimal" type="number" min="0" disabled={form.autoPrice} value={form.autoPrice?suggested:form.price} onChange={e=>setForm({...form,price:e.target.value})}/></label></div>
              <div className="pricing-rules">
                {form.pricingRules.map((rule,index)=><div className="pricing-rule" key={rule.id||index}><input aria-label="Nombre del porcentaje" value={rule.name} onChange={e=>updateRule(index,{name:e.target.value})}/><div className="percent-input"><input inputMode="decimal" type="number" step="0.01" value={rule.percent} onChange={e=>updateRule(index,{percent:e.target.value})}/><span>%</span></div><button type="button" onClick={()=>removeRule(index)} disabled={form.pricingRules.length===1}><Trash2 size={16}/></button></div>)}
                <button type="button" className="inline-add" onClick={addRule}><Plus size={15}/> Agregar porcentaje</button>
              </div>
              <div className="price-result"><span>Precio sugerido</span><strong>{money(suggested)}</strong><label><input type="checkbox" checked={form.autoPrice} onChange={e=>setForm({...form,autoPrice:e.target.checked})}/> Recalcular automáticamente cuando cambia el costo</label></div>
              <div className="rounding-preview"><span>Antes de redondear: <strong>{money(priceBreakdown.rawPrice)}</strong></span><span>Redondeo: <strong>{money(data.settings?.priceRoundingStep || 500)}</strong> · {data.settings?.priceRoundingMode === 'nearest' ? 'más cercano' : data.settings?.priceRoundingMode === 'down' ? 'hacia abajo' : 'hacia arriba'}</span><span>Diferencia: <strong>{money(priceBreakdown.roundingDifference)}</strong></span></div>
            </div>

            <div className="form-grid"><label><span>Stock actual</span><input inputMode="numeric" type="number" min="0" value={form.stock} disabled/><small className="field-hint">Se modifica mediante compras, ventas o ajustes de inventario.</small></label><label><span>Stock mínimo</span><input inputMode="numeric" type="number" min="0" value={form.minStock} onChange={e=>setForm({...form,minStock:e.target.value})}/></label></div>
            <label><span>Presentación</span><input value={form.size} onChange={e=>setForm({...form,size:e.target.value})} placeholder="Ej. 1 L"/></label>
            <label><span>Descripción</span><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label>
            <div className="toggle-row"><label><input type="checkbox" checked={form.trackStock} onChange={e=>setForm({...form,trackStock:e.target.checked})}/> Controlar stock</label><label><input type="checkbox" checked={form.active} onChange={e=>setForm({...form,active:e.target.checked})}/> Activo</label><label><input type="checkbox" checked={form.featured} onChange={e=>setForm({...form,featured:e.target.checked})}/> Destacado</label></div>
          </div>
          <div className="product-modal-footer"><button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button><button className="btn btn-primary" disabled={uploading||saving}>{saving?<><Loader2 className="spin" size={16}/> Guardando…</>:'Guardar producto'}</button></div>
        </form>
      </div>
    </div>
  )
}
