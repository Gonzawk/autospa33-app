import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getDaySummary, getMonthMatrix, toDateKey } from '../utils/appointments'

const monthLabel = date => new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(date)
const week = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export default function AppointmentCalendar({ data, month, onMonthChange, selectedDate, onSelectDate, service, admin = false }) {
  const cells = getMonthMatrix(month)
  const today = toDateKey(new Date())

  return (
    <section className="appointment-calendar-card">
      <div className="calendar-toolbar">
        <div>
          <span className="section-kicker">Calendario</span>
          <h2>{monthLabel(month)}</h2>
        </div>
        <div className="calendar-nav">
          <button type="button" onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Mes anterior"><ChevronLeft size={19}/></button>
          <button type="button" className="calendar-today" onClick={() => onMonthChange(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}>Hoy</button>
          <button type="button" onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Mes siguiente"><ChevronRight size={19}/></button>
        </div>
      </div>

      <div className="calendar-weekdays">{week.map(day => <span key={day}>{day}</span>)}</div>
      <div className="calendar-grid">
        {cells.map((date, index) => {
          if (!date) return <div className="calendar-cell calendar-empty" key={`empty-${index}`}/>
          const key = toDateKey(date)
          const summary = getDaySummary(data, key, service)
          const appointments = (data.appointments || []).filter(item => item.date === key && item.status !== 'cancelled')
          const selectable = admin || (!summary.closed && !summary.past)
          return (
            <button
              type="button"
              key={key}
              className={`calendar-cell ${selectedDate === key ? 'selected' : ''} ${key === today ? 'today' : ''} ${summary.closed ? 'closed' : ''} ${summary.past ? 'past' : ''}`}
              disabled={!selectable}
              onClick={() => onSelectDate(key)}
            >
              <span className="calendar-day-number">{date.getDate()}</span>
              {admin ? (
                <span className="calendar-day-meta">
                  {appointments.length ? `${appointments.length} turno${appointments.length > 1 ? 's' : ''}` : 'Sin turnos'}
                  {summary.pending > 0 && <small>{summary.pending} pendiente{summary.pending > 1 ? 's' : ''}</small>}
                </span>
              ) : (
                <span className="calendar-day-meta">
                  {summary.closed ? 'Cerrado' : summary.past ? 'Finalizado' : 'Disponible'}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="calendar-legend">
        <span><i className="legend-dot free"/> Disponible</span>
        <span><i className="legend-dot pending"/> Solicitud</span>
        <span><i className="legend-dot busy"/> Ocupado</span>
      </div>
    </section>
  )
}
