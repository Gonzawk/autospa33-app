import { useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import AdminSidebar from '../components/AdminSidebar'
import { useAppData } from '../context/AppDataContext'

export default function AdminLayout() {
  const [open, setOpen] = useState(false)
  const { data } = useAppData()

  if (!sessionStorage.getItem('autospa33-admin-code')) return <Navigate to="/admin" replace/>

  return (
    <div className="admin-shell">
      <AdminSidebar open={open} onClose={() => setOpen(false)}/>
      <div className="admin-main">
        <header className="admin-mobile-header">
          <button onClick={() => setOpen(true)}><Menu size={21}/></button>
          <strong>{data?.settings.displayName || 'AutoSpa #33'}</strong>
        </header>
        <main className="admin-content"><Outlet/></main>
      </div>
    </div>
  )
}
