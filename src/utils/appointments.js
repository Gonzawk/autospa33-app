export const pad = value => String(value).padStart(2, '0')

export const toDateKey = date => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

export const fromDateKey = key => {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export const formatDate = key => new Intl.DateTimeFormat('es-AR', {
  weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
}).format(fromDateKey(key))

export const formatShortDate = key => new Intl.DateTimeFormat('es-AR', {
  day: '2-digit', month: 'short'
}).format(fromDateKey(key))

export const timeToMinutes = value => {
  const [hour, minute] = value.split(':').map(Number)
  return hour * 60 + minute
}

export const minutesToTime = value => `${pad(Math.floor(value / 60))}:${pad(value % 60)}`

export const isPastDate = key => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return fromDateKey(key) < today
}

export const isWorkingDate = (key, settings) => {
  const day = fromDateKey(key).getDay()
  return (settings?.workingDays || [1, 2, 3, 4, 5, 6]).includes(day)
}

export const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd

export function getSlotsForService(data, dateKey, service) {
  if (!data || !service || isPastDate(dateKey) || !isWorkingDate(dateKey, data.appointmentSettings)) return []

  const settings = data.appointmentSettings || {}
  const start = timeToMinutes(settings.startTime || '08:30')
  const end = timeToMinutes(settings.endTime || '19:00')
  const interval = Number(settings.slotIntervalMinutes || 30)
  const duration = Number(service.durationMinutes || interval)
  const relevant = (data.appointments || []).filter(item => item.date === dateKey && item.status !== 'cancelled')
  const now = new Date()
  const todayKey = toDateKey(now)
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const slots = []

  for (let cursor = start; cursor + duration <= end; cursor += interval) {
    if (dateKey === todayKey && cursor <= nowMinutes) continue
    const candidateEnd = cursor + duration
    const collision = relevant.find(item => {
      const itemStart = timeToMinutes(item.time)
      const itemDuration = Number(item.durationMinutes || interval)
      return overlaps(cursor, candidateEnd, itemStart, itemStart + itemDuration)
    })
    slots.push({
      time: minutesToTime(cursor),
      endTime: minutesToTime(candidateEnd),
      available: !collision,
      status: collision?.status || 'free'
    })
  }

  return slots
}

export function getDaySummary(data, dateKey, service) {
  if (!isWorkingDate(dateKey, data?.appointmentSettings)) return { closed: true, free: 0, busy: 0, pending: 0 }
  if (isPastDate(dateKey)) return { past: true, free: 0, busy: 0, pending: 0 }
  const slots = service ? getSlotsForService(data, dateKey, service) : []
  const appointments = (data?.appointments || []).filter(item => item.date === dateKey && item.status !== 'cancelled')
  return {
    free: service ? slots.filter(x => x.available).length : 0,
    busy: appointments.filter(x => x.status === 'confirmed' || x.status === 'blocked').length,
    pending: appointments.filter(x => x.status === 'pending').length
  }
}

export function getMonthMatrix(monthDate) {
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const mondayIndex = (first.getDay() + 6) % 7
  const cells = []

  for (let i = 0; i < mondayIndex; i += 1) cells.push(null)
  for (let day = 1; day <= last.getDate(); day += 1) cells.push(new Date(year, month, day))
  while (cells.length % 7) cells.push(null)
  return cells
}
