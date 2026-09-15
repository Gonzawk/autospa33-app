import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { CalendarDays, Menu, Moon, ShieldCheck, ShoppingCart, Sun, X } from 'lucide-react'
import BrandLogo from './BrandLogo'
import { useTheme } from '../context/ThemeContext'
import { useAppData } from '../context/AppDataContext'

export default function PublicHeader() {
  const [open,setOpen]=useState(false)
  const {theme,toggleTheme}=useTheme()
  const {data,cartCount}=useAppData()
  if(!data) return null
  return <header className="header"><div className="container header-inner">
    <Link className="brand" to="/" onClick={()=>setOpen(false)}><BrandLogo compact/><span className="brand-copy"><strong>{data.settings.displayName}</strong><small>{data.settings.tagline}</small></span></Link>
    <nav className={`nav ${open?'nav-open':''}`}>
      <NavLink to="/" end onClick={()=>setOpen(false)}>Inicio</NavLink>
      <NavLink to="/servicios" onClick={()=>setOpen(false)}>Servicios</NavLink>
      {data.settings.bookingsEnabled&&<NavLink to="/turnos" onClick={()=>setOpen(false)}><CalendarDays size={16}/> Turnos</NavLink>}
      {data.settings.storeEnabled&&<NavLink to="/store" onClick={()=>setOpen(false)}>Store</NavLink>}
      <NavLink to="/admin" onClick={()=>setOpen(false)}><ShieldCheck size={16}/> Admin</NavLink>
    </nav>
    <div className="header-actions">
      {data.settings.storeEnabled&&<Link className="icon-button cart-header-button" to="/carrito" aria-label="Carrito"><ShoppingCart size={19}/>{cartCount>0&&<span>{cartCount}</span>}</Link>}
      <button className="icon-button" onClick={toggleTheme} aria-label="Cambiar tema">{theme==='dark'?<Sun size={19}/>:<Moon size={19}/>}</button>
      <button className="icon-button mobile-only" onClick={()=>setOpen(v=>!v)} aria-label="Menú">{open?<X size={20}/>:<Menu size={20}/>}</button>
    </div>
  </div></header>
}
