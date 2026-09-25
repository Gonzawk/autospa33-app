import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Check, PackageCheck, ShoppingCart } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext'
import { money } from '../utils/commerce'

export default function ProductDetailPage(){
  const { id } = useParams()
  const { data, loading, addToCart, cart } = useAppData()
  const [added,setAdded]=useState(false)
  const product=useMemo(()=>data?.products?.find(x=>String(x.id)===String(id) && x.active),[data,id])
  const quantity=cart.find(x=>String(x.productId)===String(id))?.quantity||0

  useEffect(()=>{ window.scrollTo({top:0,behavior:'smooth'}) },[id])

  if(loading)return <div className="screen-loader">Cargando producto…</div>
  if(!product)return <section className="page-section surface-section"><div className="container narrow-container"><div className="product-not-found"><PackageCheck size={34}/><h1>Producto no disponible</h1><p>El producto que buscás no existe o ya no está publicado.</p><Link className="btn btn-primary" to="/store"><ArrowLeft size={18}/> Volver al catálogo</Link></div></div></section>

  const hasStock=product.trackStock===false || product.stock>0
  const add=()=>{addToCart(product.id);setAdded(true);setTimeout(()=>setAdded(false),1100)}

  return <section className="page-section surface-section product-detail-page"><div className="container">
    <Link className="product-detail-back" to="/store"><ArrowLeft size={17}/> Volver al catálogo</Link>
    <div className="product-detail-layout">
      <div className="product-detail-media">
        <img src={product.image} alt={product.name}/>
        {product.featured&&<span className="product-detail-featured">Destacado</span>}
      </div>
      <div className="product-detail-content">
        <div className="product-detail-topline"><span>{product.category}{product.subcategory?` · ${product.subcategory}`:''}</span>{product.brand&&<strong>{product.brand}</strong>}</div>
        <h1>{product.name}</h1>
        <div className="product-detail-tags">{product.size&&<span>{product.size}</span>}<span className={!hasStock?'stock-low':''}>{hasStock?(product.trackStock===false?'Disponible':`Stock: ${product.stock}`):'Sin stock'}</span>{product.sku&&<span>SKU: {product.sku}</span>}</div>
        <div className="product-detail-price">{data.settings.showPrices?money(product.price):'Consultar precio'}</div>
        <div className="product-detail-description"><h2>Descripción</h2><p>{product.description?.trim()||'Este producto no tiene una descripción cargada por el momento.'}</p></div>
        <div className="product-detail-actions"><button className="btn btn-primary" disabled={!hasStock} onClick={add}>{added?<><Check size={19}/> Agregado</>:<><ShoppingCart size={19}/> Agregar al carrito</>}</button><Link className="btn btn-secondary" to="/carrito">Ver carrito{quantity>0?` (${quantity})`:''}</Link></div>
      </div>
    </div>
  </div></section>
}
