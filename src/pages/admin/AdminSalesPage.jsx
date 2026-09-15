import { useMemo, useState } from 'react'
import { ArrowRight, Plus, ReceiptText, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAppData } from '../../context/AppDataContext'
import { dateTime, money } from '../../utils/commerce'

export default function AdminSalesPage(){
  const {data,loading}=useAppData()
  const [query,setQuery]=useState('')
  const [source,setSource]=useState('all')
  if(loading)return <div className="screen-loader">Cargando ventas…</div>

  const sales=useMemo(()=> (data.sales||[]).filter(s=>{
    const text=`${s.number} ${s.customerName} ${s.paymentMethod}`.toLowerCase()
    return (!query||text.includes(query.toLowerCase())) && (source==='all'||s.source===source)
  }),[data.sales,query,source])
  const total=sales.reduce((a,s)=>a+Number(s.total||0),0)
  const profit=sales.reduce((a,s)=>a+Number(s.grossProfit||0),0)

  return <>
    <div className="admin-page-header compact-page-header">
      <div><span className="section-kicker">Comercial</span><h1>Ventas</h1><p>Historial centralizado de ventas confirmadas. El punto de venta funciona en una pantalla independiente.</p></div>
      <Link className="btn btn-primary" to="/admin/ventas/nueva"><Plus size={17}/> Nueva venta</Link>
    </div>

    <div className="summary-strip">
      <div><span>Ventas visibles</span><strong>{sales.length}</strong></div>
      <div><span>Facturación</span><strong>{money(total)}</strong></div>
      <div><span>Margen bruto</span><strong>{money(profit)}</strong></div>
    </div>

    <section className="admin-panel sales-list-panel">
      <div className="list-toolbar">
        <label className="search-box"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar por número, cliente o medio de pago…"/></label>
        <select value={source} onChange={e=>setSource(e.target.value)}><option value="all">Todos los canales</option><option value="pos">Venta presencial</option><option value="whatsapp_order">Pedido WhatsApp</option></select>
      </div>
      <div className="admin-table-wrap sales-table-wrap">
        <table className="admin-table sales-table"><thead><tr><th>Venta</th><th>Fecha</th><th>Cliente</th><th>Canal</th><th>Pago</th><th>Total</th><th>Margen bruto</th><th></th></tr></thead><tbody>
          {sales.map(s=><tr key={s.id}>
            <td data-label="Venta"><strong>{s.number}</strong></td>
            <td data-label="Fecha">{dateTime(s.createdAt)}</td>
            <td data-label="Cliente">{s.customerName}</td>
            <td data-label="Canal"><span className="status-pill neutral">{s.source==='whatsapp_order'?'WhatsApp':'Presencial'}</span></td>
            <td data-label="Pago">{s.paymentMethod}</td>
            <td data-label="Total"><strong>{money(s.total)}</strong></td>
            <td data-label="Margen"><span className="profit-text">{money(s.grossProfit)}</span></td>
            <td><Link className="table-link" to={`/admin/ventas/${s.id}`}>Ver detalle <ArrowRight size={14}/></Link></td>
          </tr>)}
          {!sales.length&&<tr><td colSpan="8"><div className="empty-agenda"><ReceiptText size={22}/> No hay ventas que coincidan con los filtros.</div></td></tr>}
        </tbody></table>
      </div>
    </section>
  </>
}
