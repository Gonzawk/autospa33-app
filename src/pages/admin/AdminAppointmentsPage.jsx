import { useEffect, useMemo, useState } from 'react'
import { Ban, CalendarPlus, Check, CheckCircle2, Clock3, MapPin, MessageCircle, Phone, RefreshCw, UserRound, X, XCircle } from 'lucide-react'
import AppointmentCalendar from '../../components/AppointmentCalendar'
import { useAppData } from '../../context/AppDataContext'
import { formatDate, formatShortDate, toDateKey } from '../../utils/appointments'
import { buildWhatsappUrl } from '../../utils/whatsapp'

const statusText = status => ({ pending:'Pendiente', confirmed:'Confirmado', completed:'Completado', blocked:'Bloqueado', cancelled:'Cancelado' }[status] || status)
const timeHHMM = value => String(value || '').slice(0,5)
const durationLabel = m => m >= 1440 && m % 1440 === 0 ? `${m/1440} días` : m >= 60 ? `${Math.floor(m/60)} h${m%60 ? ` ${m%60} min` : ''}` : `${m} min`
const confirmationMessage = item => `Hola ${item.fullName}, te confirmamos tu turno en AutoSpa #33.\n\nServicio: ${item.serviceName}\nFecha: ${formatShortDate(item.date)}\nHora: ${timeHHMM(item.time)}\n\n¡Te esperamos!`

export default function AdminAppointmentsPage() {
  const { data, loading, saveAppointment, setAppointmentStatus, refreshAppointments } = useAppData()
  const [month, setMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(toDateKey(new Date()))
  const [filter, setFilter] = useState('active')
  const [resourceFilter, setResourceFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [busyId, setBusyId] = useState(null)
  const [message, setMessage] = useState('')
  const [pageError, setPageError] = useState('')
  const [form, setForm] = useState({ type:'appointment', serviceId:'', workResourceId:'', time:'08:30', fullName:'', phone:'', durationMinutes:60 })

  useEffect(() => {
    const reload = () => refreshAppointments().catch(err => setPageError(err.message))
    reload()
    window.addEventListener('focus', reload)
    return () => window.removeEventListener('focus', reload)
  }, [])

  const appointments = Array.isArray(data?.appointments) ? data.appointments : (data?.appointments?.items || [])
  const selectedDayItems = useMemo(() => appointments
    .filter(item => item.date === selectedDate)
    .filter(item => resourceFilter === 'all' || item.workResourceId === Number(resourceFilter))
    .filter(item => filter === 'all' || (filter === 'active' ? ['pending','confirmed','blocked'].includes(item.status) : item.status === filter))
    .sort((a,b) => a.time.localeCompare(b.time)), [appointments, selectedDate, filter, resourceFilter])

  const pending = appointments.filter(item => item.status === 'pending').sort((a,b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
  const upcoming = appointments.filter(item => item.status === 'confirmed').sort((a,b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
  if (loading || !data) return <div className="screen-loader">Cargando agenda…</div>

  const services = (data.services || []).filter(item => item.active)
  const resources = (data.workResources || []).filter(item => item.active).sort((a,b) => a.resourceType.localeCompare(b.resourceType) || a.sortOrder-b.sortOrder)
  const compatibleResources = serviceId => { const service = services.find(x => x.id === Number(serviceId)); return resources.filter(x => x.resourceType === service?.resourceType) }

  const openCreate = () => { const service=services[0]; const resource=resources.find(x=>x.resourceType===service?.resourceType); setForm({type:'appointment',serviceId:String(service?.id||''),workResourceId:String(resource?.id||''),time:data.appointmentSettings?.startTime||'08:30',fullName:'',phone:'',durationMinutes:service?.bookingDurationMinutes||60}); setModalOpen(true) }
  const changeService = value => { const service=services.find(x=>x.id===Number(value)); const resource=resources.find(x=>x.resourceType===service?.resourceType); setForm({...form,serviceId:value,workResourceId:String(resource?.id||''),durationMinutes:service?.bookingDurationMinutes||60}) }
  const submit = async event => { event.preventDefault(); const service=services.find(x=>x.id===Number(form.serviceId)); await saveAppointment({date:selectedDate,time:form.time,workResourceId:Number(form.workResourceId),durationMinutes:Number(form.type==='blocked'?form.durationMinutes:service?.bookingDurationMinutes||form.durationMinutes),serviceId:form.type==='blocked'?null:service?.id,fullName:form.type==='blocked'?'Bloqueo administrativo':form.fullName.trim(),phone:form.type==='blocked'?'':form.phone.trim(),notes:'',status:form.type==='blocked'?'blocked':'confirmed'}); setModalOpen(false) }

  const changeStatus = async (item, status) => {
    setBusyId(item.id); setPageError(''); setMessage('')
    try {
      await setAppointmentStatus(item.id, status)
      const text = status === 'confirmed'
        ? `Turno de ${item.fullName} confirmado correctamente.`
        : status === 'completed'
          ? `Servicio de ${item.fullName} marcado como completado. Ya está disponible para cobrar en Caja.`
          : `Turno de ${item.fullName} cancelado.`
      setMessage(text)
    }
    catch (err) { setPageError(err.message) }
    finally { setBusyId(null) }
  }
  const sendConfirmation = item => { const url=buildWhatsappUrl(item.phone, confirmationMessage(item)); if (!url) return setPageError('El turno no tiene un WhatsApp válido.'); window.open(url,'_blank','noopener,noreferrer') }
  const modalResources = form.type === 'blocked' ? resources : compatibleResources(form.serviceId)

  return <>
    <div className="admin-page-header"><div><span className="section-kicker">Agenda por recursos</span><h1>Turnos</h1><p>Las solicitudes web quedan pendientes y bloquean capacidad hasta que las confirmes o canceles.</p></div><div className="request-actions"><button className="btn btn-secondary" onClick={()=>refreshAppointments().catch(err=>setPageError(err.message))}><RefreshCw size={17}/> Actualizar</button><button className="btn btn-primary" onClick={openCreate}><CalendarPlus size={18}/> Registrar turno</button></div></div>
    {message && <div className="notice-success">{message}</div>}{pageError && <div className="notice-error">{pageError}</div>}
    <div className="admin-booking-stats"><article><strong>{pending.length}</strong><span>Solicitudes pendientes</span></article><article><strong>{upcoming.length}</strong><span>Próximos turnos</span></article><article><strong>{resources.filter(x=>x.resourceType==='washing_platform').length}</strong><span>Plataformas activas</span></article></div>

    {pending.length > 0 && <section className="admin-panel pending-requests-panel"><div className="panel-heading"><div><span className="section-kicker">Requieren atención</span><h2>Solicitudes pendientes</h2></div></div><div className="pending-request-list">{pending.map(item=><article className="pending-request-card" key={item.id}><div className="pending-request-main"><span className="status pending">Pendiente</span><strong>{item.fullName}</strong><span>{item.serviceName}</span><small>{formatShortDate(item.date)} · {timeHHMM(item.time)} · {item.workResourceName}</small><small>Bloqueo: {durationLabel(item.bookingDurationMinutes)} · Duración total: {durationLabel(item.durationMinutes)}</small>{item.notes && <small>Nota: {item.notes}</small>}</div><div className="pending-request-contact"><Phone size={14}/> {item.phone}</div><div className="request-actions"><button disabled={busyId===item.id} className="btn btn-primary" onClick={()=>changeStatus(item,'confirmed')}><Check size={16}/> Confirmar</button><button disabled={busyId===item.id} className="btn btn-secondary" onClick={()=>changeStatus(item,'cancelled')}><XCircle size={16}/> Rechazar</button></div></article>)}</div></section>}

    <div className="admin-booking-layout"><AppointmentCalendar data={data} month={month} onMonthChange={setMonth} selectedDate={selectedDate} onSelectDate={setSelectedDate} admin/><section className="admin-day-agenda"><div className="day-agenda-header"><div><span className="section-kicker">Agenda del día</span><h2>{formatDate(selectedDate)}</h2></div><div className="agenda-filters"><select value={resourceFilter} onChange={e=>setResourceFilter(e.target.value)}><option value="all">Todos los recursos</option>{resources.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="active">Activos</option><option value="pending">Pendientes</option><option value="confirmed">Confirmados</option><option value="blocked">Bloqueos</option></select></div></div><div className="day-agenda-list">{selectedDayItems.length===0&&<div className="empty-agenda">No hay turnos registrados para este filtro.</div>}{selectedDayItems.map(item=><article className="agenda-item" key={item.id}><div className="agenda-time"><strong>{timeHHMM(item.time)}</strong><span>{item.bookingDurationMinutes} min bloqueados</span></div><div className="agenda-content"><div className="agenda-title-row"><strong>{item.serviceName}</strong><span className={`status ${item.status}`}>{statusText(item.status)}</span></div><span><MapPin size={14}/> {item.workResourceName||'Recurso anterior sin asignar'}</span><span><Clock3 size={14}/> Duración total: {durationLabel(item.durationMinutes)}</span><span><UserRound size={14}/> {item.fullName}</span>{item.phone&&<span><Phone size={14}/> {item.phone}</span>}</div><div className="agenda-actions">{item.status==='pending'&&<button title="Confirmar" onClick={()=>changeStatus(item,'confirmed')}><Check size={17}/></button>}{item.status==='confirmed'&&<button disabled={busyId===item.id} title="Marcar servicio como completado" onClick={()=>changeStatus(item,'completed')}><CheckCircle2 size={17}/></button>}{item.status==='confirmed'&&item.phone&&<button title="Enviar confirmación por WhatsApp" onClick={()=>sendConfirmation(item)}><MessageCircle size={17}/></button>}{item.status==='pending'&&<button title="Cancelar" onClick={()=>changeStatus(item,'cancelled')}><X size={17}/></button>}</div></article>)}</div></section></div>

    {modalOpen&&<div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setModalOpen(false)}><div className="modal"><button className="modal-close" type="button" onClick={()=>setModalOpen(false)}><X size={18}/></button><span className="section-kicker">Administración</span><h2>Registrar en agenda</h2><p className="modal-subtitle">Fecha: <strong>{formatDate(selectedDate)}</strong></p><form className="editor-form" onSubmit={submit}><div className="catalog-tabs compact-tabs"><button type="button" className={form.type==='appointment'?'active':''} onClick={()=>setForm({...form,type:'appointment'})}>Turno confirmado</button><button type="button" className={form.type==='blocked'?'active':''} onClick={()=>setForm({...form,type:'blocked'})}><Ban size={15}/> Bloqueo</button></div>{form.type==='appointment'&&<label><span>Servicio</span><select required value={form.serviceId} onChange={e=>changeService(e.target.value)}>{services.map(service=><option key={service.id} value={service.id}>{service.name} · bloquea {service.bookingDurationMinutes} min</option>)}</select></label>}<label><span>Plataforma / área</span><select required value={form.workResourceId} onChange={e=>setForm({...form,workResourceId:e.target.value})}><option value="">Seleccionar</option>{modalResources.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select></label><div className="form-grid"><label><span>Hora</span><input required type="time" step="1800" value={form.time} onChange={e=>setForm({...form,time:e.target.value})}/></label><label><span>Tiempo bloqueado (min)</span><input type="number" min="15" step="15" value={form.durationMinutes} onChange={e=>setForm({...form,durationMinutes:e.target.value})} disabled={form.type==='appointment'}/></label></div>{form.type==='appointment'&&<div className="form-grid"><label><span>Nombre completo</span><input required value={form.fullName} onChange={e=>setForm({...form,fullName:e.target.value})}/></label><label><span>Celular</span><input required value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label></div>}<button className="btn btn-primary full-width" type="submit"><CalendarPlus size={17}/> {form.type==='blocked'?'Bloquear recurso':'Registrar turno'}</button></form></div></div>}
  </>
}
