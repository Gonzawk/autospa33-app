import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Check, Clock3, Search } from 'lucide-react'
import { useAppData } from '../context/AppDataContext'

const money = value => new Intl.NumberFormat('es-AR', { style:'currency', currency:'ARS', maximumFractionDigits:0 }).format(value)
const duration = m => m >= 60 ? `${Math.floor(m/60)} h${m%60 ? ` ${m%60} min` : ''}` : `${m} min`

export default function ServicesPage() {
  const { data, loading } = useAppData()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Todos')

  const filtered = useMemo(() => {
    if (!data) return []
    return data.services
      .filter(x => x.active)
      .filter(x => data.serviceCategories.some(c => c.active && c.name === x.category))
      .filter(x => category === 'Todos' || x.category === category)
      .filter(x => !query.trim() || `${x.name} ${x.description} ${x.category}`.toLowerCase().includes(query.toLowerCase()))
      .sort((a,b) => a.sortOrder - b.sortOrder)
  }, [data, query, category])

  if (loading) return <div className="screen-loader">Cargando servicios…</div>

  const categories = ['Todos', ...data.serviceCategories.filter(x => x.active).map(x => x.name)]

  return (
    <section className="page-section">
      <div className="container">
        <div className="page-hero">
          <span className="section-kicker">Servicios AutoSpa #33</span>
          <h1>Elegí el tratamiento ideal para tu vehículo</h1>
          <p>Consultá duración, precio estimado e inclusiones antes de solicitar tu turno.</p>
        </div>

        <div className="catalog-toolbar">
          <label className="search-box"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar lavado, cerámico, interior..."/></label>
          <select value={category} onChange={e => setCategory(e.target.value)}>
            {categories.map(x => <option key={x}>{x}</option>)}
          </select>
        </div>

        <div className="services-page-grid">
          {filtered.map(service => (
            <article className="service-detail-card" key={service.id}>
              <div className="service-detail-top">
                <span className="pill">{service.category}</span>
                {service.featured && <span className="pill pill-primary">Recomendado</span>}
              </div>
              <h2>{service.name}</h2>
              <p>{service.description}</p>
              <div className="service-price-line">
                {data.settings.showPrices ? <strong>{money(service.priceFrom)}</strong> : <strong>Consultar</strong>}
                <span><Clock3 size={16}/> {duration(service.durationMinutes)}</span>
              </div>
              <div className="includes">{service.includes.map(x => <span key={x}><Check size={15}/> {x}</span>)}</div>
              {data.settings.bookingsEnabled && <Link to={`/turnos?servicio=${service.id}`} className="btn btn-primary full-width"><CalendarDays size={18}/> Solicitar turno</Link>}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
