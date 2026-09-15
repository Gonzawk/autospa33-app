import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

const empty = { id:0, name:'', category:'Lavado', durationMinutes:60, priceFrom:0, active:true, featured:false, sortOrder:1, description:'', includes:[] }

export default function ServiceEditor({ service, categories, onClose, onSave }) {
  const [form, setForm] = useState(service || empty)
  const [includesText, setIncludesText] = useState((service?.includes || []).join(', '))

  useEffect(() => {
    setForm(service || { ...empty, category: categories[0]?.name || 'General' })
    setIncludesText((service?.includes || []).join(', '))
  }, [service, categories])

  const submit = e => {
    e.preventDefault()
    onSave({
      ...form,
      priceFrom: Number(form.priceFrom),
      durationMinutes: Number(form.durationMinutes),
      sortOrder: Number(form.sortOrder),
      includes: includesText.split(',').map(x => x.trim()).filter(Boolean)
    })
  }

  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}><X size={20}/></button>
        <span className="section-kicker">{form.id ? 'Editar' : 'Nuevo'} servicio</span>
        <h2>{form.id ? form.name : 'Crear servicio'}</h2>
        <form className="editor-form" onSubmit={submit}>
          <label><span>Nombre</span><input required value={form.name} onChange={e => setForm({...form,name:e.target.value})}/></label>
          <div className="form-grid">
            <label><span>Categoría</span><select value={form.category} onChange={e => setForm({...form,category:e.target.value})}>{categories.filter(x => x.active).map(x => <option key={x.id}>{x.name}</option>)}</select></label>
            <label><span>Orden</span><input type="number" min="1" value={form.sortOrder} onChange={e => setForm({...form,sortOrder:e.target.value})}/></label>
          </div>
          <div className="form-grid">
            <label><span>Precio desde</span><input type="number" min="0" value={form.priceFrom} onChange={e => setForm({...form,priceFrom:e.target.value})}/></label>
            <label><span>Duración (min)</span><input type="number" min="15" value={form.durationMinutes} onChange={e => setForm({...form,durationMinutes:e.target.value})}/></label>
          </div>
          <label><span>Descripción</span><textarea required value={form.description} onChange={e => setForm({...form,description:e.target.value})}/></label>
          <label><span>Incluye (separado por comas)</span><input value={includesText} onChange={e => setIncludesText(e.target.value)}/></label>
          <div className="toggle-row">
            <label><input type="checkbox" checked={form.active} onChange={e => setForm({...form,active:e.target.checked})}/> Activo</label>
            <label><input type="checkbox" checked={form.featured} onChange={e => setForm({...form,featured:e.target.checked})}/> Destacado</label>
          </div>
          <button className="btn btn-primary full-width">Guardar</button>
        </form>
      </div>
    </div>
  )
}
