const API_URL = (import.meta.env.VITE_API_URL || 'https://localhost:7208').replace(/\/$/, '')
const ADMIN_CODE_KEY = 'autospa33-admin-code'

const parseBody = async response => {
  const text = await response.text()
  if (!text) return null
  try { return JSON.parse(text) } catch { return text }
}

const request = async (path, options = {}) => {
  const { admin = false, body, headers = {}, timeoutMs = 20000, signal, ...rest } = options
  const finalHeaders = { Accept: 'application/json', 'ngrok-skip-browser-warning': 'true', ...headers }
  if (admin) {
    const code = sessionStorage.getItem(ADMIN_CODE_KEY)
    if (code) finalHeaders['X-Admin-Code'] = code
  }
  let payload = body
  if (body !== undefined && !(body instanceof FormData)) {
    finalHeaders['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)
  if (signal) {
    if (signal.aborted) controller.abort()
    else signal.addEventListener('abort', () => controller.abort(), { once: true })
  }

  let response
  try {
    response = await fetch(`${API_URL}${path}`, { ...rest, headers: finalHeaders, body: payload, signal: controller.signal })
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('La API tardó demasiado en responder. Volvé a intentar.')
    throw error
  } finally {
    window.clearTimeout(timeoutId)
  }

  const data = await parseBody(response)
  if (!response.ok) {
    const message = data?.message || (typeof data === 'string' ? data : `Error HTTP ${response.status}`)
    const error = new Error(message)
    error.status = response.status
    error.data = data
    throw error
  }
  return data
}

const normalizeBootstrap = value => ({
  settings: value.settings,
  appointmentSettings: value.appointmentSettings,
  serviceCategories: value.serviceCategories || [],
  workResources: value.workResources || [],
  brands: value.brands || [],
  productCategories: value.productCategories || [],
  services: value.services || [],
  products: value.products || [],
  suppliers: value.suppliers || [],
  purchases: value.purchases || [],
  sales: value.sales || [],
  orders: value.orders || [],
  stockMovements: value.stockMovements || [],
  cashMovements: value.cashMovements || [],
  appointments: value.appointments || []
})

export const adminCodeStorage = {
  key: ADMIN_CODE_KEY,
  get: () => sessionStorage.getItem(ADMIN_CODE_KEY) || '',
  set: code => sessionStorage.setItem(ADMIN_CODE_KEY, code),
  clear: () => sessionStorage.removeItem(ADMIN_CODE_KEY)
}

const queryString = params => {
  const query = new URLSearchParams()
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, String(value))
  })
  return query.toString()
}

export const apiRepository = {
  loadPublic: async () => normalizeBootstrap(await request('/api/bootstrap/public')),
  loadAdmin: async () => normalizeBootstrap(await request('/api/bootstrap/admin', { admin: true })),
  getAdminProducts: params => request(`/api/admin/products?${queryString(params)}`, { admin: true }),
  getAdminSuppliers: params => request(`/api/admin/suppliers?${queryString(params)}`, { admin: true }),
  getAdminPurchases: params => request(`/api/admin/purchases?${queryString(params)}`, { admin: true }),
  getAdminPurchase: id => request(`/api/admin/purchases/${id}`, { admin: true }),
  getAdminSales: params => request(`/api/admin/sales?${queryString(params)}`, { admin: true }),
  getAdminSale: id => request(`/api/admin/sales/${id}`, { admin: true }),
  getAdminOrders: params => request(`/api/admin/orders?${queryString(params)}`, { admin: true }),
  getAdminAppointments: params => request(`/api/admin/appointments?${queryString(params)}`, { admin: true }),
  getStockMovements: params => request(`/api/admin/inventory/movements?${queryString(params)}`, { admin: true }),
  getCashMovements: params => request(`/api/admin/cash/movements?${queryString(params)}`, { admin: true }),

  verifyAdmin: code => request('/api/admin/auth/verify', { method: 'POST', body: { code } }),

  saveSettings: settings => request('/api/settings', { method: 'PUT', admin: true, body: settings }),

  saveService: service => service.id
    ? request(`/api/admin/services/${service.id}`, { method: 'PUT', admin: true, body: service })
    : request('/api/admin/services', { method: 'POST', admin: true, body: service }),
  toggleService: id => request(`/api/admin/services/${id}/toggle`, { method: 'PATCH', admin: true }),

  saveProduct: product => product.id
    ? request(`/api/admin/products/${product.id}`, { method: 'PUT', admin: true, body: product })
    : request('/api/admin/products', { method: 'POST', admin: true, body: product }),
  toggleProduct: id => request(`/api/admin/products/${id}/toggle`, { method: 'PATCH', admin: true }),
  getProductImportTemplate: () => request('/api/admin/product-files/template', { admin: true }),
  importProductsExcel: async file => {
    const form = new FormData(); form.append('file', file)
    return request('/api/admin/product-files/import', { method: 'POST', admin: true, body: form })
  },
  analyzeReceipt: async file => {
    const form = new FormData(); form.append('file', file)
    return request('/api/admin/receipt-ocr/analyze', { method: 'POST', admin: true, body: form })
  },

  uploadImage: async file => {
    const form = new FormData()
    form.append('file', file)
    return request('/api/admin/images/upload', { method: 'POST', admin: true, body: form })
  },

  saveBrand: brand => brand.id
    ? request(`/api/admin/catalog/brands/${brand.id}`, { method: 'PUT', admin: true, body: brand })
    : request('/api/admin/catalog/brands', { method: 'POST', admin: true, body: brand }),
  toggleBrand: id => request(`/api/admin/catalog/brands/${id}/toggle`, { method: 'PATCH', admin: true }),
  saveProductCategory: category => category.id
    ? request(`/api/admin/catalog/product-categories/${category.id}`, { method: 'PUT', admin: true, body: category })
    : request('/api/admin/catalog/product-categories', { method: 'POST', admin: true, body: category }),
  toggleProductCategory: id => request(`/api/admin/catalog/product-categories/${id}/toggle`, { method: 'PATCH', admin: true }),
  saveSubcategory: subcategory => subcategory.id
    ? request(`/api/admin/catalog/product-subcategories/${subcategory.id}`, { method: 'PUT', admin: true, body: subcategory })
    : request('/api/admin/catalog/product-subcategories', { method: 'POST', admin: true, body: subcategory }),
  toggleSubcategory: id => request(`/api/admin/catalog/product-subcategories/${id}/toggle`, { method: 'PATCH', admin: true }),
  saveServiceCategory: category => category.id
    ? request(`/api/admin/catalog/service-categories/${category.id}`, { method: 'PUT', admin: true, body: category })
    : request('/api/admin/catalog/service-categories', { method: 'POST', admin: true, body: category }),
  toggleServiceCategory: id => request(`/api/admin/catalog/service-categories/${id}/toggle`, { method: 'PATCH', admin: true }),

  getAvailability: (serviceId, date, preferredTime = '') => request(`/api/appointments/availability?serviceId=${encodeURIComponent(serviceId)}&date=${encodeURIComponent(date)}${preferredTime ? `&preferredTime=${encodeURIComponent(preferredTime)}` : ''}`),
  requestAppointment: appointment => request('/api/appointments/requests', { method: 'POST', body: appointment }),
  saveAppointment: appointment => request('/api/admin/appointments', { method: 'POST', admin: true, body: appointment }),
  setAppointmentStatus: (id, status) => request(`/api/admin/appointments/${id}/status`, { method: 'PATCH', admin: true, body: { status } }),
  chargeAppointment: (id, payload) => request(`/api/admin/appointments/${id}/charge`, { method: 'POST', admin: true, body: payload }),

  saveSupplier: supplier => supplier.id
    ? request(`/api/admin/suppliers/${supplier.id}`, { method: 'PUT', admin: true, body: supplier })
    : request('/api/admin/suppliers', { method: 'POST', admin: true, body: supplier }),
  toggleSupplier: id => request(`/api/admin/suppliers/${id}/toggle`, { method: 'PATCH', admin: true }),
  registerPurchase: purchase => request('/api/admin/purchases', { method: 'POST', admin: true, body: purchase }),
  createOrder: order => request('/api/orders', { method: 'POST', body: order }),
  cancelOrder: id => request(`/api/admin/orders/${id}/cancel`, { method: 'PATCH', admin: true }),
  confirmOrder: (id, payload) => request(`/api/admin/orders/${id}/confirm`, { method: 'POST', admin: true, body: payload }),
  closeOrder: (id, payload = {}) => request(`/api/admin/orders/${id}/close`, { method: 'POST', admin: true, body: payload }),
  registerSale: sale => request('/api/admin/sales', { method: 'POST', admin: true, body: sale }),
  registerCashMovement: movement => request('/api/admin/cash/movements', { method: 'POST', admin: true, body: movement }),
  adjustStock: (productId, newStock, note) => request(`/api/admin/inventory/products/${productId}/adjust`, { method: 'POST', admin: true, body: { newStock, note } })
}
