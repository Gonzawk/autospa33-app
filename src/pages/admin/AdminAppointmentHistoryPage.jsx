import { useCallback, useEffect, useState } from 'react'
import { CalendarDays, CheckCircle2, Clock3, CreditCard, ReceiptText, RefreshCw, Search, Wrench } from 'lucide-react'
import { apiRepository } from '../../repositories/apiRepository'
import { Pagination } from '../../components/admin/Pagination'
import { formatShortDate } from '../../utils/appointments'

const money = value => new Intl.NumberFormat('es-AR', { style:'currency', currency:'ARS', maximumFractionDigits:2 }).format(Number(value || 0))
const timeHHMM = value => String(value || '').slice(0,5)
const PAGE_SIZE = 10

export default function AdminAppointmentHistoryPage() {
  const [result, setResult] = useState({ items:[], page:1, pageSize:PAGE_SIZE, totalItems:0, totalPages:0 })
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setPageError('')
    try {
      setResult(await apiRepository.getAdminAppointments({ page, pageSize:PAGE_SIZE, status:'completed', search, paymentStatus:paymentFilter === 'all' ? '' : paymentFilter }))
    } catch (err) { setPageError(err.message) } finally { setLoading(false) }
  }, [page, search, paymentFilter])

  useEffect(() => { load() }, [load])
  useEffect(() => { const onFocus=()=>load(); window.addEventListener('focus',onFocus); return()=>window.removeEventListener('focus',onFocus) }, [load])

  const applySearch = event => { event.preventDefault(); setPage(1); setSearch(searchInput.trim()) }
  const changePayment = value => { setPaymentFilter(value); setPage(1) }

  return <>
    <div className="admin-page-header appointment-history-header"><div><span className="section-kicker">Servicios realizados</span><h1>Historial de turnos</h1><p>Consulta de servicios completados. Los cobros se registran exclusivamente desde Caja → Cobrar servicio.</p></div><button className="btn btn-secondary" onClick={load}><RefreshCw size={17}/> Actualizar</button></div>
    {pageError&&<div className="notice-error">{pageError}</div>}
    <section className="admin-panel history-toolbar-panel"><form className="history-toolbar" onSubmit={applySearch}><label className="history-search"><Search size={17}/><input value={searchInput} onChange={e=>setSearchInput(e.target.value)} placeholder="Buscar cliente, servicio, teléfono…"/></label><select value={paymentFilter} onChange={e=>changePayment(e.target.value)}><option value="all">Todos los cobros</option><option value="pending">Pendientes de cobro</option><option value="paid">Cobrados</option></select><button className="btn btn-secondary" type="submit">Buscar</button></form><div className="history-results-label"><strong>{result.totalItems}</strong> servicio{result.totalItems===1?'':'s'} completado{result.totalItems===1?'':'s'} · {PAGE_SIZE} por página</div></section>
    {loading ? <div className="screen-loader">Cargando historial…</div> : <section className="appointment-history-list">
      {result.items.length===0&&<div className="admin-panel empty-agenda">No hay servicios completados que coincidan con los filtros.</div>}
      {result.items.map(item=><article className="service-history-card" key={item.id}>
        <div className="service-history-topline"><span className="history-service-status"><CheckCircle2 size={14}/> Completado</span><span className={`history-payment-status ${item.saleId?'paid':'pending'}`}>{item.saleId?'Cobrado':'Pendiente de cobro'}</span></div>
        <div className="service-history-body">
          <div className="history-client-block"><span className="history-card-label">Cliente</span><h2>{item.fullName||'Cliente sin nombre'}</h2><span className="history-secondary">{item.phone||'Sin teléfono'}</span></div>
          <div className="history-detail-block"><span className="history-card-label">Servicio</span><strong><Wrench size={16}/>{item.serviceName||'Servicio'}</strong><small>{item.workResourceName||'Recurso sin informar'}</small></div>
          <div className="history-detail-block"><span className="history-card-label">Fecha y hora</span><strong><CalendarDays size={16}/>{formatShortDate(item.date)}</strong><small><Clock3 size={14}/>{timeHHMM(item.time)}</small></div>
          <div className="history-amount-block"><span className="history-card-label">Importe</span><strong>{money(item.saleId?item.finalAmount:item.servicePriceSnapshot)}</strong>{item.saleId&&Number(item.discountAmount)>0&&<small>Descuento: {money(item.discountAmount)}</small>}</div>
        </div>
        <div className="service-history-footer"><div className="history-sale-info">{item.saleId?<><CreditCard size={16}/><span>Venta registrada{item.paidAt?` · ${new Date(item.paidAt).toLocaleDateString('es-AR')}`:''}</span></>:<><ReceiptText size={16}/><span>Pendiente. Cobrar desde Caja → Cobrar servicio.</span></>}</div></div>
      </article>)}
      <div className="paged-panel-footer"><Pagination page={result.page||page} totalPages={result.totalPages||0} totalItems={result.totalItems||0} onPageChange={setPage}/></div>
    </section>}
  </>
}
