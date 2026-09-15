import { useMemo, useState } from 'react'
import { Ban, CalendarPlus, Check, Clock3, Phone, UserRound, X, XCircle } from 'lucide-react'
import AppointmentCalendar from '../../components/AppointmentCalendar'
import { useAppData } from '../../context/AppDataContext'
import { formatDate, formatShortDate, toDateKey } from '../../utils/appointments'

const statusText = status => ({ pending:'Pendiente', confirmed:'Confirmado', blocked:'Bloqueado', cancelled:'Cancelado' }[status] || status)

export default function AdminAppointmentsPage() {
  const { data, loading, saveAppointment, setAppointmentStatus } = useAppData()
  const [month, setMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(toDateKey(new Date()))
  const [filter, setFilter] = useState('active')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ type:'appointment', serviceId:'', time:'08:30', fullName:'', phone:'', durationMinutes:60 })

  const selectedDayItems = useMemo(() => (data?.appointments || [])
    .filter(item => item.date === selectedDate)
    .filter(item => filter === 'all' || (filter === 'active' ? item.status !== 'cancelled' : item.status === filter))
    .sort((a,b) => a.time.localeCompare(b.time)), [data, selectedDate, filter])

  const pending = (data?.appointments || []).filter(item => item.status === 'pending').sort((a,b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))

  if (loading) return <div className="screen-loader">Cargando agenda…</div>

  const services = data.services.filter(item => item.active)

  const openCreate = () => {
    setForm({ type:'appointment', serviceId:String(services[0]?.id || ''), time:data.appointmentSettings?.startTime || '08:30', fullName:'', phone:'', durationMinutes:services[0]?.durationMinutes || 60 })
    setModalOpen(true)
  }

  const changeService = value => {
    const service = services.find(item => item.id === Number(value))
    setForm({...form, serviceId:value, durationMinutes:service?.durationMinutes || 60})
  }

  const submit = async event => {
    event.preventDefault()
    const service = services.find(item => item.id === Number(form.serviceId))
    await saveAppointment({
      date:selectedDate,
      time:form.time,
      durationMinutes:Number(form.type === 'blocked' ? form.durationMinutes : service?.durationMinutes || form.durationMinutes),
      serviceId:form.type === 'blocked' ? null : service?.id,
      serviceName:form.type === 'blocked' ? 'Bloqueo de agenda' : service?.name,
      fullName:form.type === 'blocked' ? 'Bloqueo administrativo' : form.fullName.trim(),
      phone:form.type === 'blocked' ? '' : form.phone.trim(),
      source:'admin',
      status:form.type === 'blocked' ? 'blocked' : 'confirmed'
    })
    setModalOpen(false)
  }

  return (
    <>
      <div className="admin-page-header">
        <div><span className="section-kicker">Agenda</span><h1>Turnos</h1><p>Revisá solicitudes, confirmá turnos y bloqueá horarios desde un calendario único.</p></div>
        <button className="btn btn-primary" onClick={openCreate}><CalendarPlus size={18}/> Registrar turno</button>
      </div>

      <div className="admin-booking-stats">
        <article><strong>{pending.length}</strong><span>Solicitudes pendientes</span></article>
        <article><strong>{data.appointments.filter(x => x.status === 'confirmed').length}</strong><span>Turnos confirmados</span></article>
        <article><strong>{data.appointments.filter(x => x.status === 'blocked').length}</strong><span>Bloqueos</span></article>
      </div>

      {pending.length > 0 && (
        <section className="admin-panel pending-requests-panel">
          <div className="panel-heading"><div><span className="section-kicker">Requieren atención</span><h2>Solicitudes pendientes</h2></div></div>
          <div className="pending-request-list">
            {pending.slice(0,6).map(item => (
              <article className="pending-request-card" key={item.id}>
                <div className="pending-request-main">
                  <span className="status pending">Pendiente</span>
                  <strong>{item.fullName}</strong>
                  <span>{item.serviceName}</span>
                  <small>{formatShortDate(item.date)} · {item.time} · {item.durationMinutes} min</small>
                </div>
                <div className="pending-request-contact"><Phone size={14}/> {item.phone}</div>
                <div className="request-actions">
                  <button className="btn btn-primary" onClick={() => setAppointmentStatus(item.id,'confirmed')}><Check size={16}/> Confirmar</button>
                  <button className="btn btn-secondary" onClick={() => setAppointmentStatus(item.id,'cancelled')}><XCircle size={16}/> Rechazar</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <div className="admin-booking-layout">
        <AppointmentCalendar data={data} month={month} onMonthChange={setMonth} selectedDate={selectedDate} onSelectDate={setSelectedDate} admin/>

        <section className="admin-day-agenda">
          <div className="day-agenda-header">
            <div><span className="section-kicker">Agenda del día</span><h2>{formatDate(selectedDate)}</h2></div>
            <select value={filter} onChange={e => setFilter(e.target.value)}><option value="active">Activos</option><option value="pending">Pendientes</option><option value="confirmed">Confirmados</option><option value="blocked">Bloqueos</option><option value="all">Todos</option></select>
          </div>

          <div className="day-agenda-list">
            {selectedDayItems.length === 0 && <div className="empty-agenda">No hay turnos registrados para este día.</div>}
            {selectedDayItems.map(item => (
              <article className="agenda-item" key={item.id}>
                <div className="agenda-time"><strong>{item.time}</strong><span>{item.durationMinutes} min</span></div>
                <div className="agenda-content">
                  <div className="agenda-title-row"><strong>{item.serviceName}</strong><span className={`status ${item.status}`}>{statusText(item.status)}</span></div>
                  <span><UserRound size={14}/> {item.fullName}</span>
                  {item.phone && <span><Phone size={14}/> {item.phone}</span>}
                  <small>Origen: {item.source === 'public' ? 'Solicitud web' : 'Administrador'}</small>
                </div>
                <div className="agenda-actions">
                  {item.status === 'pending' && <button title="Confirmar" onClick={() => setAppointmentStatus(item.id,'confirmed')}><Check size={17}/></button>}
                  {item.status !== 'cancelled' && <button title="Cancelar" onClick={() => setAppointmentStatus(item.id,'cancelled')}><X size={17}/></button>}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      {modalOpen && (
        <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal">
            <button className="modal-close" type="button" onClick={() => setModalOpen(false)}><X size={18}/></button>
            <span className="section-kicker">Administración</span>
            <h2>Registrar en agenda</h2>
            <p className="modal-subtitle">Fecha seleccionada: <strong>{formatDate(selectedDate)}</strong></p>
            <form className="editor-form" onSubmit={submit}>
              <div className="catalog-tabs compact-tabs">
                <button type="button" className={form.type === 'appointment' ? 'active' : ''} onClick={() => setForm({...form,type:'appointment'})}>Turno confirmado</button>
                <button type="button" className={form.type === 'blocked' ? 'active' : ''} onClick={() => setForm({...form,type:'blocked'})}><Ban size={15}/> Bloqueo</button>
              </div>
              <div className="form-grid"><label><span>Hora</span><input required type="time" step="1800" value={form.time} onChange={e => setForm({...form,time:e.target.value})}/></label><label><span>Duración</span><input type="number" min="30" step="30" value={form.durationMinutes} onChange={e => setForm({...form,durationMinutes:e.target.value})} disabled={form.type === 'appointment'}/></label></div>
              {form.type === 'appointment' && <>
                <label><span>Servicio</span><select required value={form.serviceId} onChange={e => changeService(e.target.value)}>{services.map(service => <option key={service.id} value={service.id}>{service.name} · {service.durationMinutes} min</option>)}</select></label>
                <div className="form-grid"><label><span>Nombre completo</span><input required value={form.fullName} onChange={e => setForm({...form,fullName:e.target.value})}/></label><label><span>Celular</span><input required value={form.phone} onChange={e => setForm({...form,phone:e.target.value})}/></label></div>
              </>}
              <button className="btn btn-primary full-width" type="submit"><CalendarPlus size={17}/> {form.type === 'blocked' ? 'Bloquear horario' : 'Registrar turno'}</button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
