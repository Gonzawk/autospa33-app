import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import AdminSidebar from '../components/AdminSidebar'
import { useAppData } from '../context/AppDataContext'
import { adminCodeStorage } from '../repositories/apiRepository'

export default function AdminLayout() {
  const [open, setOpen] = useState(false)
  const [authorized, setAuthorized] = useState(Boolean(adminCodeStorage.get()))
  const { data, loading, refreshAdmin } = useAppData()
  const location = useLocation()

  useEffect(() => {
    if (!adminCodeStorage.get()) {
      setAuthorized(false)
      return
    }

    let active = true
    refreshAdmin()
      .then(() => { if (active) setAuthorized(true) })
      .catch(() => { if (active) setAuthorized(Boolean(adminCodeStorage.get())) })

    return () => { active = false }
  }, [])

  if (!authorized) return <Navigate to="/admin" replace state={{ from: location.pathname }}/>
  if (loading || !data) return <div className="screen-loader">Cargando administración…</div>

  return (
    <div className="admin-shell">
      <AdminSidebar open={open} onClose={() => setOpen(false)}/>
      <div className="admin-main">
        <header className="admin-mobile-header">
          <button type="button" onClick={() => setOpen(true)}><Menu size={21}/></button>
          <strong>{data.settings?.displayName || 'AutoSpa #33'}</strong>
        </header>
        <main className="admin-content"><Outlet/></main>
      </div>
    </div>
  )
}
