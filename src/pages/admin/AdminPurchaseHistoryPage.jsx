import { useCallback, useEffect, useState } from 'react'
import { ArrowRight, PackageCheck, RefreshCw, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { apiRepository } from '../../repositories/apiRepository'
import { Pagination } from '../../components/admin/Pagination'
import { dateTime, money } from '../../utils/commerce'

const PAGE_SIZE=10
export default function AdminPurchaseHistoryPage(){
 const [result,setResult]=useState({items:[],page:1,totalItems:0,totalPages:0});const[page,setPage]=useState(1);const[input,setInput]=useState('');const[search,setSearch]=useState('');const[loading,setLoading]=useState(true);const[error,setError]=useState('')
 const load=useCallback(async()=>{setLoading(true);setError('');try{setResult(await apiRepository.getAdminPurchases({page,pageSize:PAGE_SIZE,search}))}catch(e){setError(e.message)}finally{setLoading(false)}},[page,search])
 useEffect(()=>{load()},[load]);const submit=e=>{e.preventDefault();setPage(1);setSearch(input.trim())}
 return <><div className="admin-page-header"><div><span className="section-kicker">Abastecimiento</span><h1>Historial de compras</h1><p>Consulta paginada de compras confirmadas y su impacto de abastecimiento.</p></div><div className="admin-header-actions"><Link className="btn btn-secondary" to="/admin/compras">Nueva compra</Link><button className="btn btn-secondary" onClick={load}><RefreshCw size={17}/> Actualizar</button></div></div>
 {error&&<div className="notice-error">{error}</div>}
 <section className="admin-panel history-toolbar-panel"><form className="history-toolbar" onSubmit={submit}><label className="history-search"><Search size={17}/><input value={input} onChange={e=>setInput(e.target.value)} placeholder="Compra, proveedor o comprobante…"/></label><button className="btn btn-secondary">Buscar</button></form><div className="history-results-label"><strong>{result.totalItems}</strong> compra{result.totalItems===1?'':'s'} · {PAGE_SIZE} por página</div></section>
 {loading?<div className="screen-loader">Cargando historial…</div>:<section className="professional-history-list">{!result.items.length&&<div className="admin-panel empty-agenda">No hay compras que coincidan con la búsqueda.</div>}{result.items.map(x=><article className="admin-panel professional-history-card" key={x.id}><div className="history-card-primary"><span className="status-pill success"><PackageCheck size={13}/> Confirmada</span><h2>{x.number}</h2><p>{x.supplierName}</p></div><div className="history-card-meta"><div><span>Fecha</span><strong>{dateTime(x.createdAt)}</strong></div><div><span>Comprobante</span><strong>{x.invoiceNumber||'Sin comprobante'}</strong></div><div><span>Pago</span><strong>{x.paymentMethod||'—'}</strong></div></div><div className="history-card-amount"><span>Total</span><strong>{money(x.totalCost)}</strong><small>{(x.items||[]).length} línea{(x.items||[]).length===1?'':'s'}</small></div><Link className="history-detail-link" to={`/admin/compras/${x.id}`}>Ver detalle <ArrowRight size={15}/></Link></article>)}<div className="paged-panel-footer"><Pagination page={result.page||page} totalPages={result.totalPages||0} totalItems={result.totalItems||0} onPageChange={setPage}/></div></section>}
 </>
}
