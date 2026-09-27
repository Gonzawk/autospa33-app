import { useEffect,useRef,useState } from 'react'
import { Check,ChevronDown,FileDown,FileSpreadsheet,Settings2,X } from 'lucide-react'
import { adminCodeStorage } from '../repositories/apiRepository'

const API_URL=(import.meta.env.VITE_API_URL||'https://localhost:7208').replace(/\/$/,'')

const options=[
 ['sku','SKU'],['name','Nombre'],['brand','Marca'],['category','Categoría'],
 ['subcategory','Subcategoría'],['cost','Costo'],['price','Precio'],
 ['size','Presentación'],['stock','Stock'],['minStock','Stock mínimo'],['active','Estado']
]

const defaultFields=['name','cost','price','size','stock']

export default function ProductDataTools(){
 const[open,setOpen]=useState(false)
 const[selected,setSelected]=useState(defaultFields)
 const[fieldsOpen,setFieldsOpen]=useState(false)
 const[busy,setBusy]=useState(false)
 const[err,setErr]=useState('')
 const fieldsRef=useRef(null)

 useEffect(()=>{
  if(!fieldsOpen)return
  const close=e=>{if(!fieldsRef.current?.contains(e.target))setFieldsOpen(false)}
  document.addEventListener('mousedown',close)
  return()=>document.removeEventListener('mousedown',close)
 },[fieldsOpen])

 useEffect(()=>{
  if(!open)return
  const close=e=>{if(e.key==='Escape')setOpen(false)}
  document.addEventListener('keydown',close)
  return()=>document.removeEventListener('keydown',close)
 },[open])

 const toggle=k=>setSelected(v=>v.includes(k)?v.filter(x=>x!==k):[...v,k])
 const fields=selected.join(',')

 const download=async(fileName,path)=>{
  setErr('');setBusy(true)
  try{
   const r=await fetch(`${API_URL}${path}`,{headers:{'X-Admin-Code':adminCodeStorage.get(),'ngrok-skip-browser-warning':'true'}})
   if(!r.ok)throw new Error('No se pudo generar el archivo.')
   const blob=await r.blob()
   const url=URL.createObjectURL(blob)
   const a=document.createElement('a')
   a.href=url;a.download=fileName;document.body.appendChild(a);a.click();a.remove()
   URL.revokeObjectURL(url)
  }catch(e){setErr(e.message)}finally{setBusy(false)}
 }

 return <>
  <div className="product-export-toolbar">
   <button className="btn btn-secondary" type="button" onClick={()=>{setErr('');setOpen(true)}}>
    <FileDown size={17}/> Exportar productos
   </button>
  </div>

  {open&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setOpen(false)}}>
   <section className="modal product-export-modal" role="dialog" aria-modal="true" aria-labelledby="product-export-title">
    <button className="modal-close" type="button" aria-label="Cerrar" onClick={()=>setOpen(false)}><X size={18}/></button>

    <div className="product-export-heading">
     <div className="product-export-icon"><FileSpreadsheet size={22}/></div>
     <div>
      <span className="section-kicker">Exportación</span>
      <h2 id="product-export-title">Exportar productos</h2>
      <p>Generá una plantilla con la información actual del catálogo. Elegí qué datos querés incluir y descargala en Excel o PDF.</p>
     </div>
    </div>

    {err&&<div className="notice-error">{err}</div>}

    <div className="product-export-field">
     <span>Columnas del archivo</span>
     <div className={`export-field-select ${fieldsOpen?'open':''}`} ref={fieldsRef}>
      <button type="button" className="export-field-trigger" onClick={()=>setFieldsOpen(v=>!v)} aria-expanded={fieldsOpen}>
       <span><Settings2 size={16}/>{selected.length} de {options.length} columnas seleccionadas</span>
       <ChevronDown size={17}/>
      </button>
      {fieldsOpen&&<div className="export-field-menu">
       <div className="export-field-menu-head">
        <strong>Datos a incluir</strong>
        <button type="button" onClick={()=>setSelected(selected.length===options.length?[]:options.map(([k])=>k))}>{selected.length===options.length?'Quitar todas':'Seleccionar todas'}</button>
       </div>
       <div className="export-field-options">
        {options.map(([k,label])=><label key={k} className={selected.includes(k)?'selected':''}>
         <input type="checkbox" checked={selected.includes(k)} onChange={()=>toggle(k)}/>
         <span className="export-check"><Check size={13}/></span>
         <span>{label}</span>
        </label>)}
       </div>
      </div>}
     </div>
     <small className="field-help">La selección solo define las columnas visibles en el archivo exportado; no modifica ningún producto.</small>
    </div>

    <div className="product-export-summary">
     <span>Formato de salida</span>
     <strong>{selected.length?`${selected.length} columnas listas para exportar`:'Seleccioná al menos una columna'}</strong>
    </div>

    <div className="product-export-actions">
     <button className="btn btn-primary" type="button" disabled={!selected.length||busy} onClick={()=>download('AutoSpa33-Productos.xlsx',`/api/admin/product-files/export/excel?fields=${encodeURIComponent(fields)}`)}>
      <FileSpreadsheet size={17}/> {busy?'Generando…':'Exportar Excel'}
     </button>
     <button className="btn btn-secondary" type="button" disabled={!selected.length||busy} onClick={()=>download('AutoSpa33-Productos.pdf',`/api/admin/product-files/export/pdf?fields=${encodeURIComponent(fields)}`)}>
      <FileDown size={17}/> Exportar PDF
     </button>
    </div>
   </section>
  </div>}
 </>
}
