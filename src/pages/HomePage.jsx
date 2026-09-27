import { ArrowRight, CalendarCheck2, ShoppingBag, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'
import { useAppData } from '../context/AppDataContext'

const money = value => new Intl.NumberFormat('es-AR', { style:'currency', currency:'ARS', maximumFractionDigits:0 }).format(value)

export default function HomePage() {
  const { data, loading } = useAppData()
  if (loading) return <div className="screen-loader">Cargando AutoSpa #33…</div>

  const services = data.services.filter(x => x.active)
  const products = data.products.filter(x => x.active)
  const featuredServices = services.filter(x => x.featured).slice(0, 3)
  const featuredProducts = products.filter(x => x.featured).slice(0, 3)

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow"><Sparkles size={16}/> {data.settings.tagline}</div>
            <div className="hero-brand-line"><BrandLogo/><span>{data.settings.displayName}</span></div>
            <h1>{data.settings.heroTitle}</h1>
            <p>{data.settings.heroSubtitle}</p>
            <div className="hero-actions">
              {data.settings.bookingsEnabled ? <Link className="btn btn-primary" to="/turnos"><CalendarCheck2 size={19}/> Solicitar turno</Link> : <Link className="btn btn-primary" to="/servicios"><CalendarCheck2 size={19}/> Ver servicios</Link>}
              {data.settings.storeEnabled && <Link className="btn btn-secondary" to="/store"><ShoppingBag size={19}/> Ir a la store</Link>}
            </div>
            <div className="hero-stats">
              <div><strong>{services.length}</strong><span>Servicios activos</span></div>
              <div><strong>{data.brands.filter(x => x.active).length}</strong><span>Marcas</span></div>
              <div><strong>{products.length}</strong><span>Productos</span></div>
            </div>
          </div>

          <div className="hero-card">
            <span className="hero-card-badge">AutoSpa #33 · Detailing</span>
            <div className="hero-card-content">
              <p>Atención programada</p>
              <h3>Más orden, menos espera y un mejor cuidado de cada detalle.</h3>
              <Link to={data.settings.bookingsEnabled ? "/turnos" : "/servicios"}>{data.settings.bookingsEnabled ? "Ver agenda" : "Explorar servicios"} <ArrowRight size={17}/></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section compact-section">
        <div className="container">
          <div className="section-heading">
            <div><span className="section-kicker">Servicios</span><h2>Los más elegidos</h2></div>
            <Link className="text-link" to="/servicios">Ver todos <ArrowRight size={16}/></Link>
          </div>
          <div className="mini-grid">
            {featuredServices.map(item => (
              <article className="mini-card" key={item.id}>
                <span>{item.category}</span>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                {data.settings.showPrices && <strong>Desde {money(item.priceFrom)}</strong>}
              </article>
            ))}
          </div>
        </div>
      </section>

      {data.settings.storeEnabled && (
        <section className="section surface-section">
          <div className="container">
            <div className="section-heading">
              <div><span className="section-kicker">Store</span><h2>Productos recomendados</h2></div>
              <Link className="text-link" to="/store">Ver catálogo <ArrowRight size={16}/></Link>
            </div>
            <div className="product-preview-grid">
              {featuredProducts.map(item => (
                <article className="product-preview" key={item.id}>
                  <Link className="product-preview-image" to={`/store/producto/${item.id}`} aria-label={`Ver ${item.name}`}>
                    <img src={item.image} alt={item.name}/>
                  </Link>
                  <div><small>{item.brand} · {item.subcategory}</small><h3><Link to={`/store/producto/${item.id}`}>{item.name}</Link></h3>{data.settings.showPrices && <strong>{money(item.price)}</strong>}</div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
