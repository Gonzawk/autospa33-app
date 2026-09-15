export const money = value => new Intl.NumberFormat('es-AR', { style:'currency', currency:'ARS', maximumFractionDigits:0 }).format(Number(value) || 0)

export const roundCommercialPrice = (value, step = 500, mode = 'up') => {
  const numeric = Number(value) || 0
  const increment = Math.max(1, Number(step) || 1)
  const ratio = numeric / increment
  if (mode === 'nearest') return Math.round(ratio) * increment
  if (mode === 'down') return Math.floor(ratio) * increment
  return Math.ceil(ratio) * increment
}

export const calculatePriceBreakdown = (cost, rules = [], step = 500, mode = 'up') => {
  const base = Number(cost) || 0
  let current = base
  const lines = rules.map(rule => {
    const before = current
    const percent = Number(rule.percent) || 0
    const amount = before * percent / 100
    current = before + amount
    return { ...rule, percent, before, amount, after:current }
  })
  const rawPrice = current
  const roundedPrice = roundCommercialPrice(rawPrice, step, mode)
  return { base, lines, rawPrice, roundedPrice, roundingDifference:roundedPrice - rawPrice }
}

export const calculateSuggestedPrice = (cost, rules = [], step = 500, mode = 'up') => calculatePriceBreakdown(cost, rules, step, mode).roundedPrice

export const nextDocumentNumber = (prefix, list = []) => `${prefix}-${String(Math.max(0, ...list.map(x => Number(String(x.number || '').split('-').pop()) || 0)) + 1).padStart(6, '0')}`

export const dateTime = value => value ? new Intl.DateTimeFormat('es-AR', { dateStyle:'short', timeStyle:'short' }).format(new Date(value)) : '—'
export const shortDate = value => value ? new Intl.DateTimeFormat('es-AR', { dateStyle:'medium' }).format(new Date(value)) : '—'

export const movementLabel = type => ({ purchase:'Compra', sale:'Venta', adjustment_in:'Ajuste +', adjustment_out:'Ajuste −' }[type] || type)
