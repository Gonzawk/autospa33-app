import { useCallback, useEffect, useState } from 'react'
import { RefreshCw, Search, ShoppingBag, XCircle } from 'lucide-react'
import { apiRepository } from '../../repositories/apiRepository'
import { Pagination } from '../../components/admin/Pagination'
import { money, dateTime } from '../../utils/commerce'

const PAGE_SIZE = 10
const statusLabel = status => ({ closed:'Venta cerrada', cancelled:'Cancelado' }[status] || status)

export default function AdminOrderHistoryPage() {
  const [result, setResult] = useState({ items:[], page:1, pageSize:PAGE_SIZE, totalItems:0, totalPages:0 })
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('history')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      setResult(await apiRepository.getAdminOrders({ page, pageSize:PAGE_SIZE, status, search }))
    } catch (err) { setError(err.message || 'No se pudo cargar el historial.') }
    finally { setLoading(false) }
  }, [page, status, search])

  useEffect(() => { load() }, [load])
  useEffect(() => { const onFocus=()=>load(); window.addEventListener('focus',onFocus); return()=>window.removeEventListener('focus',onFocus) }, [load])

  const submitSearch = event => { event.preventDefault(); setPage(1); setSearch(searchInput.trim()) }
  const changeStatus = value => { setStatus(value); setPage(1) }

  return <>
    <div className="admin-page-header order-history-header"><div><span className="section-kicker">Consulta histórica</span><h1>Historial de pedidos</h1><p>Pedidos finalizados o cancelados. Esta pantalla es solo de consulta y no modifica stock, ventas ni Caja.</p></div><button className="btn btn-secondary" onClick={load}><RefreshCw size={17}/> Actualizar</button></div>
    {error&&<div className="notice-error">{error}</div>}
    <section className="admin-panel history-toolbar-panel"><form className="history-toolbar" onSubmit={submitSearch}><label className="history-search"><Search size={17}/><input value={searchInput} onChange={e=>setSearchInput(e.target.value)} placeholder="Código, cliente o teléfono…"/></label><select value={status} onChange={e=>changeStatus(e.target.value)}><option value="history">Todos</option><option value="closed">Ventas cerradas</option><option value="cancelled">Cancelados</option></select><button className="btn btn-secondary" type="submit">Buscar</button></form><div className="history-results-label"><strong>{result.totalItems}</strong> pedido{result.totalItems===1?'':'s'} · {PAGE_SIZE} por página</div></section>
    {loading ? <div className="screen-loader">Cargando historial…</div> : <section className="order-history-list">
      {result.items.length===0&&<div className="admin-panel empty-agenda">No hay pedidos que coincidan con los filtros.</div>}
      {result.items.map(order=><article className="admin-panel order-history-card" key={order.id}>
        <div className="order-history-card-head"><div><span className={`status ${order.status}`}>{statusLabel(order.status)}</span><h2>{order.publicCode}</h2><p>{order.customerName} · {order.phone||'Sin teléfono'}</p></div><div className="order-history-total"><span>Total</span><strong>{money(order.total)}</strong></div></div>
        <div className="order-history-meta"><span><strong>Pago:</strong> {order.paymentMethod||'—'}</span><span><strong>Creado:</strong> {dateTime(order.createdAt)}</span>{order.confirmedAt&&<span><strong>Confirmado:</strong> {dateTime(order.confirmedAt)}</span>}{order.closedAt&&<span><strong>Cerrado:</strong> {dateTime(order.closedAt)}</span>}</div>
        <div className="order-history-items">{(order.items||[]).map(item=><div key={item.id||item.productId}><span>{item.quantity} × {item.name}</span><strong>{money(item.subtotal)}</strong></div>)}</div>
        <div className="order-history-footer">{order.status==='closed'?<span className="history-sale-info"><ShoppingBag size={16}/> Venta registrada{order.saleId?` · #${order.saleId}`:''}</span>:<span className="history-sale-info"><XCircle size={16}/> Pedido cancelado sin generar venta.</span>}</div>
      </article>)}
      <div className="paged-panel-footer"><Pagination page={result.page||page} totalPages={result.totalPages||0} totalItems={result.totalItems||0} onPageChange={setPage}/></div>
    </section>}
  </>
}
