import { useEffect, useMemo, useState } from 'react'
import { CalendarCheck2, CheckCircle2, Clock3, Info, Phone, UserRound, Wrench, X } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import AppointmentCalendar from '../components/AppointmentCalendar'
import { useAppData } from '../context/AppDataContext'
import { formatDate } from '../utils/appointments'

export default function AppointmentsPage() {
  const { data, loading, requestAppointment, getAvailability } = useAppData()
  const [params] = useSearchParams()
  const requestedServiceId = Number(params.get('servicio'))
  const [serviceId, setServiceId] = useState(Number.isFinite(requestedServiceId) ? requestedServiceId : 0)
  const [month, setMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [sent, setSent] = useState(false)
  const [slots, setSlots] = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [form, setForm] = useState({ fullName: '', phone: '' })

  const services = useMemo(() => data?.services.filter(item => item.active).sort((a, b) => a.sortOrder - b.sortOrder) || [], [data])
  const selectedService = services.find(item => item.id === Number(serviceId)) || null
  useEffect(() => {
    let active = true
    if (!selectedDate || !selectedService) { setSlots([]); return }
    setSlotsLoading(true)
    getAvailability(selectedService.id, selectedDate)
      .then(result => { if (active) setSlots(result.slots || []) })
      .catch(() => { if (active) setSlots([]) })
      .finally(() => { if (active) setSlotsLoading(false) })
    return () => { active = false }
  }, [selectedDate, selectedService?.id])

  if (loading) return <div className="screen-loader">Cargando agenda…</div>
  if (!data.settings.bookingsEnabled) return <div className="screen-loader">La solicitud de turnos está temporalmente deshabilitada.</div>

  const selectService = value => {
    setServiceId(Number(value))
    setSelectedDate('')
    setSelectedTime('')
    setSlots([])
    setSent(false)
  }

  const selectDate = key => {
    setSelectedDate(key)
    setSelectedTime('')
    setSent(false)
  }

  const openRequest = time => {
    setSelectedTime(time)
    setFormOpen(true)
    setSent(false)
  }

  const submit = async event => {
    event.preventDefault()
    if (!selectedService || !selectedDate || !selectedTime || !form.fullName.trim() || !form.phone.trim()) return
    await requestAppointment({
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      durationMinutes: selectedService.durationMinutes,
      date: selectedDate,
      time: selectedTime,
      fullName: form.fullName.trim(),
      phone: form.phone.trim()
    })
    setFormOpen(false)
    setSent(true)
    setSelectedTime('')
    setForm({ fullName: '', phone: '' })
  }

  return (
    <section className="page-section appointments-page">
      <div className="container">
        <div className="page-hero booking-hero">
          <span className="section-kicker">Turnos online</span>
          <h1>Elegí un horario disponible y solicitá tu turno</h1>
          <p>No necesitás registrarte. Seleccioná el servicio, elegí una fecha y completá tus datos. La solicitud quedará pendiente hasta que AutoSpa #33 la confirme.</p>
        </div>

        <div className="booking-steps">
          <article><span>1</span><div><strong>Servicio</strong><small>Elegí qué querés realizar.</small></div></article>
          <article><span>2</span><div><strong>Fecha y horario</strong><small>Solo se muestran horarios disponibles.</small></div></article>
          <article><span>3</span><div><strong>Solicitud</strong><small>Ingresá nombre y celular.</small></div></article>
        </div>

        {sent && (
          <div className="booking-success">
            <CheckCircle2 size={22}/>
            <div><strong>Solicitud enviada correctamente</strong><p>El horario quedó reservado mientras el administrador revisa tu solicitud. Cuando sea confirmado se mostrará como ocupado.</p></div>
          </div>
        )}

        <div className="booking-layout">
          <aside className="booking-sidebar">
            <div className="booking-panel">
              <span className="section-kicker">Paso 1</span>
              <h2>Servicio deseado</h2>
              <label className="booking-field"><span>Servicio</span><select value={serviceId} onChange={e => selectService(e.target.value)}><option value="0">Seleccionar servicio</option>{services.map(service => <option value={service.id} key={service.id}>{service.name}</option>)}</select></label>
              {selectedService && (
                <div className="selected-service-card">
                  <Wrench size={19}/>
                  <div><strong>{selectedService.name}</strong><span><Clock3 size={14}/> {selectedService.durationMinutes} min</span></div>
                </div>
              )}
            </div>

            <div className="booking-panel booking-info-panel">
              <Info size={18}/>
              <div><strong>¿Cómo funciona?</strong><p>Los horarios en revisión no aceptan otra solicitud para evitar superposiciones. El administrador puede confirmar, cancelar o bloquear horarios desde su calendario.</p></div>
            </div>
          </aside>

          <div className="booking-main">
            <AppointmentCalendar data={data} month={month} onMonthChange={setMonth} selectedDate={selectedDate} onSelectDate={selectDate} service={selectedService}/>

            <section className="time-slots-card">
              <div className="time-slots-heading">
                <div><span className="section-kicker">Paso 2</span><h2>{selectedDate ? formatDate(selectedDate) : 'Seleccioná una fecha'}</h2></div>
                {selectedService && <span className="duration-chip"><Clock3 size={15}/> {selectedService.durationMinutes} min</span>}
              </div>

              {!selectedService && <div className="empty-slots">Primero elegí un servicio para calcular la disponibilidad real según su duración.</div>}
              {selectedService && !selectedDate && <div className="empty-slots">Elegí un día disponible en el calendario.</div>}
              {selectedService && selectedDate && slotsLoading && <div className="empty-slots">Consultando disponibilidad…</div>}
              {selectedService && selectedDate && !slotsLoading && (
                <div className="time-slots-grid">
                  {slots.length === 0 && <div className="empty-slots full-span">No hay horarios disponibles para esta fecha.</div>}
                  {slots.map(slot => (
                    <button type="button" key={slot.time} disabled={!slot.available} className={`time-slot ${slot.available ? 'free' : slot.status}`} onClick={() => slot.available && openRequest(slot.time)}>
                      <strong>{slot.time}</strong><small>{slot.available ? `hasta ${slot.endTime}` : slot.status === 'pending' ? 'En revisión' : 'Ocupado'}</small>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {formOpen && (
        <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setFormOpen(false)}>
          <div className="modal booking-modal">
            <button className="modal-close" type="button" onClick={() => setFormOpen(false)}><X size={18}/></button>
            <span className="section-kicker">Paso 3 · Solicitud</span>
            <h2>Completá tus datos</h2>
            <div className="booking-summary">
              <CalendarCheck2 size={20}/>
              <div><strong>{selectedService.name}</strong><span>{formatDate(selectedDate)} · {selectedTime}</span></div>
            </div>
            <form className="editor-form" onSubmit={submit}>
              <label><span>Nombre completo</span><div className="input-with-icon"><UserRound size={18}/><input required value={form.fullName} onChange={e => setForm({...form, fullName:e.target.value})} placeholder="Ej. Juan Pérez"/></div></label>
              <label><span>Número de celular</span><div className="input-with-icon"><Phone size={18}/><input required type="tel" value={form.phone} onChange={e => setForm({...form, phone:e.target.value})} placeholder="Ej. 383 400 0033"/></div></label>
              <p className="form-helper">No se crea ninguna cuenta. Tus datos se utilizarán únicamente para gestionar esta solicitud.</p>
              <button className="btn btn-primary full-width" type="submit"><CalendarCheck2 size={18}/> Enviar solicitud</button>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
