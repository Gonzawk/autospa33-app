import { useEffect, useMemo, useState } from 'react'
import { CalendarCheck2, CheckCircle2, Clock3, Info, MessageCircle, Phone, UserRound, Wrench, X } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import AppointmentCalendar from '../components/AppointmentCalendar'
import { useAppData } from '../context/AppDataContext'
import { formatDate } from '../utils/appointments'

const durationLabel = minutes => {
  if (minutes >= 1440 && minutes % 1440 === 0) return `${minutes / 1440} día${minutes === 1440 ? '' : 's'}`
  if (minutes >= 60 && minutes % 60 === 0) return `${minutes / 60} h`
  if (minutes > 60) return `${Math.floor(minutes / 60)} h ${minutes % 60} min`
  return `${minutes} min`
}

export default function AppointmentsPage() {
  const { data, loading, requestAppointment, getAvailability } = useAppData()
  const [params] = useSearchParams()
  const requestedServiceId = Number(params.get('servicio'))
  const [serviceId, setServiceId] = useState(Number.isFinite(requestedServiceId) ? requestedServiceId : 0)
  const [month, setMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [availability, setAvailability] = useState(null)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slotsError, setSlotsError] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [success, setSuccess] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ fullName: '', phone: '', notes: '' })

  const services = useMemo(
    () => data?.services.filter(item => item.active).sort((a, b) => a.sortOrder - b.sortOrder) || [],
    [data]
  )
  const selectedService = services.find(item => item.id === Number(serviceId)) || null

  useEffect(() => {
    let active = true

    setSelectedTime('')
    setAvailability(null)
    setSlotsError('')

    // La disponibilidad se consulta apenas existe servicio + fecha.
    // El frontend NO fabrica horarios: renderiza exclusivamente los slots
    // devueltos por la API, que ya contempla recursos ocupados y hora actual.
    if (!selectedService || !selectedDate) {
      setSlotsLoading(false)
      return () => { active = false }
    }

    setSlotsLoading(true)
    getAvailability(selectedService.id, selectedDate)
      .then(result => {
        if (active) setAvailability(result)
      })
      .catch(err => {
        if (active) setSlotsError(err.message)
      })
      .finally(() => {
        if (active) setSlotsLoading(false)
      })

    return () => { active = false }
  }, [selectedService?.id, selectedDate])

  if (loading || !data) return <div className="screen-loader">Cargando agenda…</div>
  if (!data.settings?.bookingsEnabled) return <div className="screen-loader">La solicitud de turnos está temporalmente deshabilitada.</div>

  const resetAfterService = () => {
    setSelectedDate('')
    setSelectedTime('')
    setAvailability(null)
    setSuccess(null)
    setSlotsError('')
  }

  const selectService = value => {
    setServiceId(Number(value))
    resetAfterService()
  }

  const selectDate = key => {
    setSelectedDate(key)
    setSelectedTime('')
    setAvailability(null)
    setSuccess(null)
    setSlotsError('')
  }

  const openRequest = time => {
    setSelectedTime(time)
    setFormOpen(true)
    setSuccess(null)
  }

  const submit = async event => {
    event.preventDefault()
    if (!selectedService || !selectedDate || !selectedTime || !form.fullName.trim() || !form.phone.trim()) return

    setSubmitting(true)
    setSlotsError('')
    try {
      const created = await requestAppointment({
        serviceId: selectedService.id,
        date: selectedDate,
        time: selectedTime,
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        notes: form.notes.trim()
      })

      const successSnapshot = {
        id: created?.id,
        serviceName: selectedService.name,
        date: selectedDate,
        time: selectedTime,
        fullName: form.fullName.trim(),
        phone: form.phone.trim()
      }

      setFormOpen(false)
      setSuccess(successSnapshot)

      // Una vez que la API confirmó el alta, limpiamos por completo el flujo.
      // El snapshot anterior conserva únicamente los datos necesarios para el modal.
      setServiceId(0)
      setSelectedDate('')
        setSelectedTime('')
      setAvailability(null)
      setSlotsError('')
      setForm({ fullName: '', phone: '', notes: '' })
      setMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
    } catch (err) {
      setFormOpen(false)
      setSlotsError(err.message)
      try {
        const refreshed = await getAvailability(selectedService.id, selectedDate)
        setAvailability(refreshed)
      } catch { /* El mensaje original es el más útil. */ }
    } finally {
      setSubmitting(false)
    }
  }

  const slots = availability?.slots || []

  return (
    <section className="page-section appointments-page">
      <div className="container">
        <div className="page-hero booking-hero">
          <span className="section-kicker">Turnos online</span>
          <h1>Elegí tu servicio, día y horario preferido</h1>
          <p>AutoSpa #33 revisa automáticamente la capacidad disponible. No necesitás elegir una plataforma: el sistema asigna internamente la que corresponda.</p>
        </div>

        <div className="booking-steps">
          <article><span>1</span><div><strong>Servicio</strong><small>Elegí el trabajo.</small></div></article>
          <article><span>2</span><div><strong>Día y hora</strong><small>Indicá cuándo preferís venir.</small></div></article>
          <article><span>3</span><div><strong>Confirmación</strong><small>Elegí una opción disponible y enviala.</small></div></article>
        </div>

        {slotsError && (
          <div className="booking-success booking-warning">
            <Info size={22}/>
            <div><strong>No pudimos completar la operación</strong><p>{slotsError}</p></div>
          </div>
        )}

        <div className="booking-layout">
          <aside className="booking-sidebar">
            <div className="booking-panel">
              <span className="section-kicker">Paso 1</span>
              <h2>Servicio</h2>
              <label className="booking-field">
                <span>Servicio</span>
                <select value={serviceId} onChange={e => selectService(e.target.value)}>
                  <option value="0">Seleccionar servicio</option>
                  {services.map(service => <option value={service.id} key={service.id}>{service.name}</option>)}
                </select>
              </label>

              {selectedService && (
                <div className="selected-service-card">
                  <Wrench size={19}/>
                  <div>
                    <strong>{selectedService.name}</strong>
                    <span><Clock3 size={14}/> Duración estimada: {durationLabel(selectedService.durationMinutes)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="booking-panel booking-info-panel">
              <Info size={18}/>
              <div>
                <strong>Asignación automática</strong>
                <p>Las plataformas y áreas de trabajo son administradas internamente. La web solo muestra horarios que realmente tienen capacidad para el servicio elegido.</p>
              </div>
            </div>
          </aside>

          <div className="booking-main">
            <AppointmentCalendar
              data={data}
              month={month}
              onMonthChange={setMonth}
              selectedDate={selectedDate}
              onSelectDate={selectDate}
              service={selectedService}
            />

            <section className="time-slots-card">
              <div className="time-slots-heading">
                <div>
                  <span className="section-kicker">Paso 2</span>
                  <h2>{selectedDate ? formatDate(selectedDate) : 'Seleccioná una fecha'}</h2>
                </div>
              </div>

              {!selectedService && <div className="empty-slots">Primero elegí un servicio.</div>}
              {selectedService && !selectedDate && <div className="empty-slots">Elegí un día disponible en el calendario.</div>}

              {selectedService && selectedDate && slotsLoading && (
                <div className="empty-slots">Consultando disponibilidad real…</div>
              )}

              {availability && !slotsLoading && (
                <>
                  <div className={`booking-success ${availability.status === 'no_availability' || availability.status === 'alternatives' ? 'booking-warning' : ''}`}>
                    {availability.status === 'preferred_available' ? <CheckCircle2 size={22}/> : <Info size={22}/>} 
                    <div><strong>{availability.message}</strong></div>
                  </div>

                  {availability.status === 'no_availability' ? (
                    <div className="empty-slots">Probá con otra fecha para este servicio.</div>
                  ) : (
                    <div className="time-slots-grid">
                      {slots.map(slot => (
                        <button
                          type="button"
                          key={slot.time}
                          className="time-slot free"
                          onClick={() => openRequest(slot.time)}
                        >
                          <strong>{slot.time}</strong>
                          <small>Horario disponible</small>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        </div>
      </div>

      {success && (
        <div className="modal-backdrop booking-success-backdrop" role="presentation">
          <div className="modal booking-success-modal" role="dialog" aria-modal="true" aria-labelledby="booking-success-title">
            <div className="booking-success-icon"><CheckCircle2 size={38}/></div>
            <span className="section-kicker">Solicitud recibida</span>
            <h2 id="booking-success-title">¡Tu turno fue solicitado correctamente!</h2>
            <p className="booking-success-copy">La solicitud ya quedó registrada en AutoSpa #33 y está <strong>pendiente de confirmación</strong>.</p>

            <div className="booking-success-summary">
              <div><span>Servicio</span><strong>{success.serviceName}</strong></div>
              <div><span>Fecha</span><strong>{formatDate(success.date)}</strong></div>
              <div><span>Horario</span><strong>{success.time}</strong></div>
              {success.id && <div><span>Solicitud</span><strong>#{success.id}</strong></div>}
            </div>

            <div className="booking-success-whatsapp">
              <MessageCircle size={21}/>
              <div>
                <strong>¿Qué sigue ahora?</strong>
                <p>El lavadero revisará la solicitud y, cuando confirme el turno, se comunicará al WhatsApp <strong>{success.phone}</strong>.</p>
              </div>
            </div>

            <button type="button" className="btn btn-primary full-width" onClick={() => setSuccess(null)}>
              Entendido
            </button>
          </div>
        </div>
      )}

      {formOpen && (
        <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setFormOpen(false)}>
          <div className="modal booking-modal">
            <button className="modal-close" type="button" onClick={() => setFormOpen(false)}><X size={18}/></button>
            <span className="section-kicker">Confirmar solicitud</span>
            <h2>Completá tus datos</h2>
            <div className="booking-summary">
              <CalendarCheck2 size={20}/>
              <div><strong>{selectedService?.name}</strong><span>{formatDate(selectedDate)} · {selectedTime}</span></div>
            </div>
            <form className="editor-form" onSubmit={submit}>
              <label><span>Nombre completo</span><div className="input-with-icon"><UserRound size={18}/><input required value={form.fullName} onChange={e => setForm({...form, fullName:e.target.value})} placeholder="Ej. Juan Pérez"/></div></label>
              <label><span>Número de celular</span><div className="input-with-icon"><Phone size={18}/><input required type="tel" value={form.phone} onChange={e => setForm({...form, phone:e.target.value})} placeholder="Ej. 383 400 0033"/></div></label>
              <label><span>Observaciones (opcional)</span><textarea value={form.notes} onChange={e => setForm({...form, notes:e.target.value})} placeholder="Ej. vehículo, detalle a revisar, etc."/></label>
              <button disabled={submitting} className="btn btn-primary full-width">
                <CalendarCheck2 size={18}/> {submitting ? 'Registrando…' : 'Enviar solicitud de turno'}
              </button>
              <small className="checkout-note">La API vuelve a validar el horario y asigna automáticamente una plataforma o área antes de registrar la solicitud.</small>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
