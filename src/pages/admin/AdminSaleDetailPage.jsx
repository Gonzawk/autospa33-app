import { ArrowLeft, CircleDollarSign, PackageCheck, ReceiptText } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useAppData } from '../../context/AppDataContext'
import { dateTime, money } from '../../utils/commerce'

export default function AdminSaleDetailPage(){
  const {id}=useParams(); const location=useLocation(); const {data,loading}=useAppData(); if(loading)return <div className="screen-loader">Cargando venta…</div>
  const sale=(data.sales||[]).find(x=>x.id===Number(id))
  if(!sale)return <div className="admin-panel empty-agenda"><h2>Venta no encontrada</h2><Link className="btn btn-secondary" to="/admin/ventas">Volver</Link></div>
  const marginPct=sale.total?Number(sale.grossProfit||0)/Number(sale.total)*100:0
  return <>
    <div className="admin-page-header compact-page-header"><div><Link className="back-link" to="/admin/ventas"><ArrowLeft size={15}/> Volver al historial</Link><span className="section-kicker">Detalle de venta</span><h1>{sale.number}</h1><p>Registro completo de la operación y su impacto económico.</p></div><span className="status-pill success">Confirmada</span></div>
    {location.state?.created&&<div className="notice-success">Venta confirmada correctamente. El stock y los movimientos ya fueron actualizados.</div>}
    <div className="sale-detail-stats"><article><ReceiptText/><span>Total vendido</span><strong>{money(sale.total)}</strong></article><article><PackageCheck/><span>Costo vendido</span><strong>{money(sale.costTotal)}</strong></article><article><CircleDollarSign/><span>Margen bruto</span><strong>{money(sale.grossProfit)}</strong><small>{marginPct.toFixed(1)}% sobre venta</small></article></div>
    <div className="detail-two-columns"><section className="admin-panel"><h2>Productos</h2><div className="sale-items-detail">{sale.items.map((item,index)=><article key={`${item.productId}-${index}`}><div><strong>{item.name}</strong><span>{item.sku}</span></div><div><span>{item.quantity} × {money(item.unitPrice)}</span><strong>{money(item.subtotal)}</strong></div><small>Costo: {money(item.unitCost)} c/u · Ganancia bruta: {money(item.subtotal-item.quantity*item.unitCost)}</small></article>)}</div></section><aside className="admin-panel sale-meta"><h2>Datos de la operación</h2><dl><div><dt>Fecha</dt><dd>{dateTime(sale.createdAt)}</dd></div><div><dt>Cliente</dt><dd>{sale.customerName}</dd></div>{sale.phone&&<div><dt>Celular</dt><dd>{sale.phone}</dd></div>}<div><dt>Origen</dt><dd>{sale.source==='whatsapp_order'?'Pedido WhatsApp':'Punto de venta'}</dd></div><div><dt>Medio de pago</dt><dd>{sale.paymentMethod}</dd></div>{sale.orderId&&<div><dt>Pedido vinculado</dt><dd>#{sale.orderId}</dd></div>}{sale.notes&&<div><dt>Notas</dt><dd>{sale.notes}</dd></div>}</dl></aside></div>
  </>
}
