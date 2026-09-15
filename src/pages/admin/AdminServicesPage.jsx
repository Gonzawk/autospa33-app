import { useMemo, useState } from 'react'
import { Edit3, Eye, EyeOff, Plus, Search } from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import ServiceEditor from '../../components/ServiceEditor'

const money = value => new Intl.NumberFormat('es-AR', { style:'currency', currency:'ARS', maximumFractionDigits:0 }).format(value)

export default function AdminServicesPage() {
  const { data, loading, saveService, toggleService } = useAppData()
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(undefined)

  const filtered = useMemo(() => data?.services.filter(x => !query.trim() || `${x.name} ${x.category}`.toLowerCase().includes(query.toLowerCase())) || [], [data, query])
  if (loading) return <div className="screen-loader">Cargando…</div>

  const save = async item => { await saveService(item); setEditing(undefined) }

  return (
    <>
      <div className="admin-page-header">
        <div><span className="section-kicker">Administración</span><h1>Servicios</h1><p>Lo que esté inactivo deja de mostrarse automáticamente al cliente.</p></div>
        <button className="btn btn-primary" onClick={() => setEditing(null)}><Plus size={17}/> Nuevo servicio</button>
      </div>
      <label className="search-box admin-search"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar servicio..."/></label>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Servicio</th><th>Categoría</th><th>Precio</th><th>Duración</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>{filtered.map(x => (
            <tr key={x.id}>
              <td data-label="Servicio"><strong>{x.name}</strong>{x.featured && <small className="table-badge">Destacado</small>}</td>
              <td data-label="Categoría">{x.category}</td>
              <td data-label="Precio">{money(x.priceFrom)}</td>
              <td data-label="Duración">{x.durationMinutes} min</td>
              <td data-label="Estado"><span className={`status ${x.active ? 'active' : 'inactive'}`}>{x.active ? 'Activo' : 'Inactivo'}</span></td>
              <td data-label="Acciones"><div className="table-actions"><button onClick={() => setEditing(x)} title="Editar"><Edit3 size={16}/></button><button onClick={() => toggleService(x.id)} title="Cambiar estado">{x.active ? <EyeOff size={16}/> : <Eye size={16}/>}</button></div></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      {editing !== undefined && <ServiceEditor service={editing} categories={data.serviceCategories} onClose={() => setEditing(undefined)} onSave={save}/>}
    </>
  )
}
