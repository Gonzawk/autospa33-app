export const cashCategoryLabel = category => ({
  product_sale:'Venta de productos',
  service_income:'Servicio realizado',
  purchase:'Compra de mercadería',
  capital_deposit:'Ingreso de fondos',
  owner_withdrawal:'Retiro de fondos',
  manual_income:'Otro ingreso',
  manual_expense:'Otro egreso'
}[category] || category)

export const signedCashAmount = movement => (movement?.direction === 'out' ? -1 : 1) * Number(movement?.amount || 0)

export const cashSummary = movements => {
  const rows = movements || []
  const balance = rows.reduce((sum,m) => sum + signedCashAmount(m), 0)
  const operationalIncome = rows.filter(m => ['product_sale','service_income','manual_income'].includes(m.category)).reduce((sum,m)=>sum+Number(m.amount||0),0)
  const operationalExpense = rows.filter(m => ['purchase','manual_expense'].includes(m.category)).reduce((sum,m)=>sum+Number(m.amount||0),0)
  const deposits = rows.filter(m => m.category === 'capital_deposit').reduce((sum,m)=>sum+Number(m.amount||0),0)
  const withdrawals = rows.filter(m => m.category === 'owner_withdrawal').reduce((sum,m)=>sum+Number(m.amount||0),0)
  return { balance, operationalIncome, operationalExpense, operatingCashResult:operationalIncome-operationalExpense, deposits, withdrawals }
}
