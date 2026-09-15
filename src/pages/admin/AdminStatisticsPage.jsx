import { useMemo, useState } from 'react'
import { Boxes, CircleDollarSign, PackagePlus, ShoppingBag, Sparkles, TrendingUp } from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { buildCommercialAnalytics } from '../../utils/analytics'
import { money, shortDate } from '../../utils/commerce'

const coverage = value => value == null ? 'Sin rotación' : value < 1 ? '< 1 día' : `${Math.round(value)} días`
const pct = value => `${Number(value || 0).toFixed(1)}%`

export default function AdminStatisticsPage(){
  const { data, loading } = useAppData()
  const [days, setDays] = useState(30)
  const analytics = useMemo(() => data ? buildCommercialAnalytics(data, days) : null, [data, days])

  if (loading || !analytics) return <div className="screen-loader">Calculando estadísticas…</div>

  const top = analytics.topProfit
  const reinvest = analytics.topReinvestment
  const ranking = analytics.ranking
  const maxProfit = Math.max(1, ...ranking.map(x => x.profit))

  return <>
    <div className="admin-page-header compact-page-header">
      <div>
        <span className="section-kicker">Decisiones comerciales</span>
        <h1>¿Qué productos dejan más ganancia?</h1>
        <p>Una lectura simple del período para saber qué se vende, cuánto deja y dónde conviene volver a invertir.</p>
      </div>
      <select className="period-select" value={days} onChange={e => setDays(Number(e.target.value))}>
        <option value={7}>Últimos 7 días</option>
        <option value={30}>Últimos 30 días</option>
        <option value={90}>Últimos 90 días</option>
        <option value={0}>Todo el historial</option>
      </select>
    </div>

    {top ? <section className="profit-hero admin-panel">
      <div className="profit-hero-product">
        <div className="profit-hero-image">{top.product.image ? <img src={top.product.image} alt=""/> : <Boxes/>}</div>
        <div>
          <span className="section-kicker">Producto que más ganancia generó</span>
          <h2>{top.product.name}</h2>
          <p>{top.sold} unidades vendidas · Stock actual {top.product.stock}</p>
        </div>
      </div>
      <div className="profit-hero-number">
        <small>Ganancia bruta del período</small>
        <strong>{money(top.profit)}</strong>
        <span>{pct(top.profitShare)} de toda la ganancia de productos</span>
      </div>
      <div className={`reinvestment-box tone-${reinvest?.restockTone || 'muted'}`}>
        <Sparkles/>
        <div>
          <small>Mejor candidato para reinvertir</small>
          <strong>{reinvest?.product.name || 'Sin datos'}</strong>
          <p>{reinvest ? `${money(reinvest.profit)} de ganancia · ${coverage(reinvest.stockCoverageDays)} de cobertura · ${reinvest.restockStatus}` : 'Todavía no hay ventas suficientes.'}</p>
        </div>
      </div>
    </section> : <section className="admin-panel empty-commercial-state"><TrendingUp/><h2>Todavía no hay ventas en este período</h2><p>Elegí otro período o registrá nuevas ventas para generar el ranking.</p></section>}

    <div className="simple-commercial-kpis">
      <article><CircleDollarSign/><div><span>Ganancia total</span><strong>{money(analytics.grossProfit)}</strong><small>Después del costo de los productos vendidos</small></div></article>
      <article><ShoppingBag/><div><span>Facturación</span><strong>{money(analytics.totalRevenue)}</strong><small>{analytics.sales.length} ventas · {analytics.unitsSold} unidades</small></div></article>
      <article><PackagePlus/><div><span>Compras registradas</span><strong>{money(analytics.purchaseInvestment)}</strong><small>{analytics.purchases.length} compras de stock en el período</small></div></article>
    </div>

    <section className="admin-panel profit-ranking-panel">
      <div className="panel-title-row">
        <div><h2>Ranking de ganancia por producto</h2><p>Ordenado por la ganancia bruta total que dejó cada producto dentro del período elegido.</p></div>
      </div>
      <div className="profit-ranking-list">
        {ranking.map((row, index) => <article className="profit-ranking-row" key={row.product.id}>
          <div className="profit-rank">#{index + 1}</div>
          <div className="performance-main">
            <div className="product-avatar">{row.product.image ? <img src={row.product.image} alt=""/> : <Boxes/>}</div>
            <div><strong>{row.product.name}</strong><span>{row.product.sku} · {row.sold} vendidas</span></div>
          </div>
          <div className="profit-main-cell">
            <span>Ganancia</span>
            <strong>{money(row.profit)}</strong>
            <div className="metric-bar"><i style={{ width: `${Math.max(0, row.profit) / maxProfit * 100}%` }}/></div>
          </div>
          <div className="profit-secondary-cell"><span>Aporte al total</span><strong>{pct(row.profitShare)}</strong></div>
          <div className="profit-secondary-cell"><span>Ganancia por unidad</span><strong>{money(row.profitPerUnit)}</strong></div>
          <div className="profit-stock-cell">
            <span>Stock / cobertura</span>
            <strong>{row.product.stock} un. · {coverage(row.stockCoverageDays)}</strong>
            <small className={`stock-decision tone-${row.restockTone}`}>{row.restockStatus}</small>
          </div>
        </article>)}
        {!ranking.length && <div className="empty-table">No hay productos vendidos en este período.</div>}
      </div>
    </section>

    <section className="admin-panel commercial-context-panel">
      <div><PackagePlus/><div><strong>Análisis basado en operaciones registradas</strong><p>Los indicadores se calculan con las compras y ventas reales registradas. El ranking puede cambiar según el período seleccionado y los costos históricos de cada venta.</p></div></div>
      <div className="commercial-context-stats"><span><b>{analytics.purchases.length}</b> compras</span><span><b>{analytics.sales.length}</b> ventas</span><span><b>{ranking.length}</b> productos con movimiento</span></div>
    </section>

    <div className="analytics-note"><strong>Cómo usar esta pantalla</strong><p>Primero mirá qué producto dejó más <b>ganancia total</b>. Después revisá su <b>stock y cobertura</b>. Si además de ser rentable tiene poca cobertura, es un buen candidato para reponer. La recomendación es orientativa: en el backend la calcularemos con datos reales y reglas de negocio configurables.</p></div>
  </>
}
