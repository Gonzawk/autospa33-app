import { useMemo,useState } from 'react'
import { ArrowLeft, Banknote, CheckCircle2, Landmark, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext'
import { money } from '../utils/commerce'

export default function CartPage(){
  const {data,loading,cart,updateCartQuantity,removeFromCart,createOrder}=useAppData()
  const [form,setForm]=useState({name:'',phone:'',paymentMethod:'Efectivo',notes:''})
  const [sending,setSending]=useState(false)
  const [created,setCreated]=useState(null)
  const [error,setError]=useState('')
  const items=useMemo(()=>data?cart.map(row=>{const p=data.products.find(x=>x.id===row.productId);return p?{...p,quantity:row.quantity,subtotal:p.price*row.quantity}:null}).filter(Boolean):[],[data,cart])
  const total=items.reduce((s,x)=>s+x.subtotal,0)
  if(loading)return <div className="screen-loader">Cargando carrito…</div>
  if(!data.settings.storeEnabled)return <Navigate to="/" replace/>

  const submit=async e=>{
    e.preventDefault();if(!items.length)return
    setSending(true);setError('')
    try{
      const order=await createOrder({customerName:form.name,phone:form.phone,paymentMethod:form.paymentMethod,notes:form.notes,items:items.map(x=>({productId:x.id,quantity:x.quantity}))})
      setCreated(order)
    }catch(err){setError(err.message||'No pudimos registrar el pedido.')}finally{setSending(false)}
  }

  if(created)return <section className="page-section surface-section"><div className="container narrow-container"><div className="order-success"><CheckCircle2 size={34}/><span className="section-kicker">Solicitud registrada</span><h1>{created.publicCode}</h1><p>Tu pedido quedó pendiente de revisión. Cuando AutoSpa #33 lo confirme, podrás realizar el pago por <strong>{created.paymentMethod||form.paymentMethod}</strong>. La venta y el movimiento de caja se registran recién cuando el negocio verifica el pago y cierra la operación.</p><div className="order-success-total"><span>Total confirmado al revisar</span><strong>{money(created.total)}</strong></div><Link className="btn btn-primary" to="/store">Volver a la tienda</Link></div></div></section>

  return <section className="page-section surface-section"><div className="container"><div className="page-hero compact"><span className="section-kicker">Tu pedido</span><h1>Carrito de compra</h1><p>Revisá cantidades, elegí cómo vas a pagar y enviá la solicitud.</p></div>
    {!items.length?<div className="empty-cart"><ShoppingCart size={36}/><h2>Tu carrito está vacío</h2><p>Agregá productos desde la tienda.</p><Link className="btn btn-primary" to="/store"><ArrowLeft size={17}/> Ver productos</Link></div>:<div className="cart-layout"><div className="cart-items">{items.map(x=><article className="cart-item" key={x.id}><img src={x.image} alt={x.name}/><div className="cart-item-copy"><small>{x.brand} · {x.sku}</small><h2>{x.name}</h2><span>{money(x.price)} c/u</span></div><div className="qty-control"><button type="button" onClick={()=>updateCartQuantity(x.id,x.quantity-1)}><Minus size={15}/></button><strong>{x.quantity}</strong><button type="button" disabled={x.quantity>=x.stock} onClick={()=>updateCartQuantity(x.id,x.quantity+1)}><Plus size={15}/></button></div><strong className="cart-line-total">{money(x.subtotal)}</strong><button type="button" className="danger-icon" onClick={()=>removeFromCart(x.id)}><Trash2 size={17}/></button></article>)}</div>
      <aside className="checkout-card"><span className="section-kicker">Solicitud</span><h2>Datos de contacto</h2><form onSubmit={submit}><label><span>Nombre completo</span><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label><span>Celular / WhatsApp</span><input required value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label><fieldset className="payment-choice"><legend>¿Cómo vas a pagar?</legend><label className={form.paymentMethod==='Efectivo'?'selected':''}><input type="radio" name="paymentMethod" value="Efectivo" checked={form.paymentMethod==='Efectivo'} onChange={e=>setForm({...form,paymentMethod:e.target.value})}/><Banknote size={20}/><span><strong>Efectivo</strong><small>Pagás al coordinar la entrega o retiro.</small></span></label><label className={form.paymentMethod==='Transferencia'?'selected':''}><input type="radio" name="paymentMethod" value="Transferencia" checked={form.paymentMethod==='Transferencia'} onChange={e=>setForm({...form,paymentMethod:e.target.value})}/><Landmark size={20}/><span><strong>Transferencia</strong><small>El negocio confirmará el pedido antes del pago.</small></span></label></fieldset><label><span>Observaciones</span><textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Ej. retiro por la tarde"/></label>{error&&<div className="notice-error">{error}</div>}<div className="checkout-summary"><div><span>Productos</span><strong>{items.reduce((s,x)=>s+x.quantity,0)}</strong></div><div className="checkout-total"><span>Total estimado</span><strong>{money(total)}</strong></div></div><button className="btn btn-primary full-width" disabled={sending}><CheckCircle2 size={18}/> {sending?'Registrando…':'Enviar solicitud de pedido'}</button><small className="checkout-note">El stock se valida nuevamente al confirmar y al cerrar la venta. La caja se afecta únicamente cuando el administrador cierra la operación.</small></form></aside></div>}
  </div></section>
}
