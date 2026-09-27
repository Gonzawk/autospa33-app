import { useState } from 'react'
import { LockKeyhole, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'
import { adminCodeStorage, apiRepository } from '../repositories/apiRepository'
import { useAppData } from '../context/AppDataContext'

export default function AdminLoginPage() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const navigate = useNavigate()
  const { refreshAdmin } = useAppData()

  const submit = async e => {
    e.preventDefault()
    setError('')
    setSending(true)
    try {
      await apiRepository.verifyAdmin(code)
      adminCodeStorage.set(code)
      await refreshAdmin()
      navigate('/admin/dashboard')
    } catch (err) {
      adminCodeStorage.clear()
      setError(err.status === 401 ? 'Código de acceso incorrecto.' : err.message)
    } finally { setSending(false) }
  }

  return (
    <section className="admin-login-page">
      <div className="admin-login-card">
        <BrandLogo/>
        <div className="lock-circle"><LockKeyhole size={25}/></div>
        <span className="section-kicker">Acceso privado</span>
        <h1>Administración</h1>
        <p>Gestión integral de turnos, productos, compras, stock, pedidos y ventas.</p>
        <form onSubmit={submit}>
          <label><span>Código de acceso</span><input required value={code} onChange={e => setCode(e.target.value)} autoComplete="off" placeholder="Ingresá el código"/></label>
          {error && <small className="form-error">{error}</small>}
          <button className="btn btn-primary full-width" disabled={sending}>{sending ? <><Loader2 className="spin" size={17}/> Verificando…</> : 'Ingresar'}</button>
        </form>
      </div>
    </section>
  )
}
