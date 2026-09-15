const dayMs = 86400000

const safeDate = value => {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

export const buildCommercialAnalytics = (data, days = 30) => {
  const referenceDate = new Date()
  const periodStart = days === 0 ? null : new Date(referenceDate.getTime() - days * dayMs)
  const inPeriod = value => {
    if (!periodStart) return true
    const date = safeDate(value)
    return !!date && date >= periodStart && date <= referenceDate
  }

  const sales = (data.sales || []).filter(s => inPeriod(s.createdAt))
  const purchases = (data.purchases || []).filter(p => inPeriod(p.createdAt || p.date))
  const products = data.products || []

  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.total || 0), 0)
  const totalCost = sales.reduce((sum, s) => sum + Number(s.costTotal || 0), 0)
  const grossProfit = totalRevenue - totalCost
  const unitsSold = sales.reduce((sum, s) => sum + (s.items || []).reduce((a, i) => a + Number(i.quantity || 0), 0), 0)
  const purchaseInvestment = purchases.reduce((sum, p) => sum + Number(p.totalCost || 0), 0)

  let effectiveDays = days
  if (!days) {
    const dated = sales.map(s => safeDate(s.createdAt)).filter(Boolean).map(d => d.getTime())
    const oldest = dated.length ? Math.min(...dated) : referenceDate.getTime()
    effectiveDays = Math.max(1, Math.ceil((referenceDate.getTime() - oldest) / dayMs))
  }

  const byProduct = products.map(product => {
    const saleRows = sales.flatMap(s => (s.items || [])
      .filter(i => i.productId === product.id)
      .map(i => ({ ...i, saleDate: s.createdAt })))
    const purchaseRows = purchases.flatMap(p => (p.items || [])
      .filter(i => i.productId === product.id)
      .map(i => ({ ...i, purchaseDate: p.createdAt || p.date })))

    const sold = saleRows.reduce((sum, i) => sum + Number(i.quantity || 0), 0)
    const revenue = saleRows.reduce((sum, i) => sum + Number(i.subtotal || Number(i.quantity || 0) * Number(i.unitPrice || 0)), 0)
    const cost = saleRows.reduce((sum, i) => sum + Number(i.quantity || 0) * Number(i.unitCost ?? product.costPrice ?? 0), 0)
    const profit = revenue - cost
    const margin = revenue ? profit / revenue * 100 : 0
    const profitPerUnit = sold ? profit / sold : 0
    const avgDailyUnits = sold / Math.max(1, effectiveDays)
    const stockCoverageDays = avgDailyUnits > 0 ? Number(product.stock || 0) / avgDailyUnits : null
    const lastSaleAt = saleRows.length ? saleRows.map(r => r.saleDate).sort().at(-1) : null
    const purchasedUnits = purchaseRows.reduce((sum, i) => sum + Number(i.quantity || 0), 0)
    const invested = purchaseRows.reduce((sum, i) => sum + Number(i.subtotal || Number(i.quantity || 0) * Number(i.unitCost || 0)), 0)

    let restockStatus = 'Sin ventas'
    let restockTone = 'muted'
    if (sold > 0 && stockCoverageDays != null) {
      if (stockCoverageDays <= 14) { restockStatus = 'Reponer ahora'; restockTone = 'danger' }
      else if (stockCoverageDays <= 30) { restockStatus = 'Reponer pronto'; restockTone = 'warning' }
      else { restockStatus = 'Stock saludable'; restockTone = 'success' }
    }

    return {
      product, sold, revenue, cost, profit, margin, profitPerUnit,
      avgDailyUnits, stockCoverageDays, lastSaleAt,
      purchasedUnits, invested, restockStatus, restockTone,
      profitShare: grossProfit > 0 ? profit / grossProfit * 100 : 0
    }
  })

  const active = byProduct.filter(x => x.sold > 0)
  const ranking = [...active].sort((a, b) => b.profit - a.profit)
  const topProfit = ranking[0] || null
  const topReinvestment = [...active].sort((a, b) => {
    const urgencyA = a.stockCoverageDays == null ? 0 : Math.max(0.5, Math.min(2, 30 / Math.max(1, a.stockCoverageDays)))
    const urgencyB = b.stockCoverageDays == null ? 0 : Math.max(0.5, Math.min(2, 30 / Math.max(1, b.stockCoverageDays)))
    return (b.profit * urgencyB) - (a.profit * urgencyA)
  })[0] || null

  return {
    days, referenceDate, periodStart, sales, purchases,
    totalRevenue, totalCost, grossProfit, unitsSold, purchaseInvestment,
    byProduct, ranking, topProfit, topReinvestment
  }
}
