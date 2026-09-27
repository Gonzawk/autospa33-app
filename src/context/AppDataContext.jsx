import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { apiRepository, adminCodeStorage } from '../repositories/apiRepository'

const AppDataContext = createContext(null)

const listItems = value => Array.isArray(value) ? value : Array.isArray(value?.items) ? value.items : []
const CART_KEY = 'autospa33-cart-v8'

export function AppDataProvider({ children }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]') } catch { return [] }
  })

  const refresh = async (admin = false) => {
    setLoading(true)
    try {
      const next = admin ? await apiRepository.loadAdmin() : await apiRepository.loadPublic()
      setData(next)
      setError('')
      return next
    } catch (err) {
      if (admin && err.status === 401) {
        adminCodeStorage.clear()
        const next = await apiRepository.loadPublic()
        setData(next)
        setError('')
        return next
      }
      setError(err.message || 'No se pudo cargar la información.')
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // El arranque público nunca depende de una sesión administrativa previa.
    // El área admin solicita su bootstrap únicamente al ingresar a /admin/*.
    refresh(false).catch(() => {})
  }, [])
  useEffect(() => { localStorage.setItem(CART_KEY, JSON.stringify(cart)) }, [cart])

  const mutateAdmin = async operation => {
    const result = await operation()
    await refresh(true)
    return result
  }

  // Función real compartida por la pantalla y por confirmOrder.
  // No se referencia un método hermano del objeto useMemo (eso provocaba
  // "refreshOrders is not defined" después de confirmar).
  const refreshOrdersData = async () => {
    const response = await apiRepository.getAdminOrders({ page: 1, pageSize: 100, status: 'active' })
    const orders = listItems(response)
    setData(current => current ? { ...current, orders } : current)
    return orders
  }

  const api = useMemo(() => ({
    data,
    error,
    loading,
    cart,
    cartCount: cart.reduce((sum, x) => sum + x.quantity, 0),
    refreshPublic: () => refresh(false),
    refreshAdmin: () => refresh(true),
    async refreshAppointments() {
      const response = await apiRepository.getAdminAppointments({ page: 1, pageSize: 100 })
      const appointments = listItems(response)
      setData(current => current ? { ...current, appointments } : current)
      return appointments
    },
    refreshOrders: refreshOrdersData,

    addToCart(productId, quantity = 1) {
      if (!data) return
      const product = data.products.find(x => x.id === productId && x.active)
      if (!product || (product.trackStock !== false && product.stock <= 0)) return
      setCart(current => {
        const found = current.find(x => x.productId === productId)
        const requested = (found?.quantity || 0) + Number(quantity || 1)
        const desired = product.trackStock === false ? requested : Math.min(product.stock, requested)
        if (found) return current.map(x => x.productId === productId ? { ...x, quantity: desired } : x)
        return [...current, { productId, quantity: product.trackStock === false ? Number(quantity || 1) : Math.min(product.stock, Number(quantity || 1)) }]
      })
    },
    updateCartQuantity(productId, quantity) {
      if (!data) return
      const product = data.products.find(x => x.id === productId)
      const requested = Math.max(0, Number(quantity) || 0)
      const safe = product?.trackStock === false ? requested : Math.min(product?.stock || 0, requested)
      setCart(current => safe === 0 ? current.filter(x => x.productId !== productId) : current.map(x => x.productId === productId ? { ...x, quantity: safe } : x))
    },
    removeFromCart(productId) { setCart(current => current.filter(x => x.productId !== productId)) },
    clearCart() { setCart([]) },

    saveSettings: settings => mutateAdmin(() => apiRepository.saveSettings(settings)),

    saveService: service => mutateAdmin(() => apiRepository.saveService({
      serviceCategoryId: data.serviceCategories.find(x => x.name === service.category)?.id ?? service.serviceCategoryId ?? null,
      name: service.name,
      durationMinutes: Number(service.durationMinutes),
      bookingDurationMinutes: Number(service.bookingDurationMinutes || service.durationMinutes),
      resourceType: service.resourceType || 'washing_platform',
      priceFrom: Number(service.priceFrom),
      active: Boolean(service.active),
      featured: Boolean(service.featured),
      sortOrder: Number(service.sortOrder) || 1,
      description: service.description || '',
      includes: service.includes || [],
      id: service.id || 0
    })),
    toggleService: id => mutateAdmin(() => apiRepository.toggleService(id)),

    saveProduct: product => {
      const brandId = data.brands.find(x => x.name === product.brand)?.id ?? product.brandId ?? null
      const category = data.productCategories.find(x => x.name === product.category)
      const subcategoryId = category?.subcategories.find(x => x.name === product.subcategory)?.id ?? product.productSubcategoryId ?? null
      return mutateAdmin(() => apiRepository.saveProduct({
        id: product.id || 0,
        sku: product.sku,
        name: product.name,
        brandId,
        productCategoryId: category?.id ?? product.productCategoryId ?? null,
        productSubcategoryId: subcategoryId,
        price: Number(product.price) || 0,
        costPrice: Number(product.costPrice) || 0,
        minStock: Number(product.minStock) || 0,
        size: product.size || '',
        active: Boolean(product.active),
        featured: Boolean(product.featured),
        autoPrice: Boolean(product.autoPrice),
        trackStock: product.trackStock !== false,
        image: product.image || '',
        description: product.description || '',
        pricingRules: (product.pricingRules || []).map((r, index) => ({ id: r.id || null, name: r.name, percent: Number(r.percent) || 0, sortOrder: index + 1 }))
      }))
    },
    toggleProduct: id => mutateAdmin(() => apiRepository.toggleProduct(id)),
    uploadProductImage: async file => (await apiRepository.uploadImage(file)).url,

    saveBrand: brand => mutateAdmin(() => apiRepository.saveBrand(brand)),
    toggleBrand: id => mutateAdmin(() => apiRepository.toggleBrand(id)),
    saveServiceCategory: category => mutateAdmin(() => apiRepository.saveServiceCategory(category)),
    toggleServiceCategory: id => mutateAdmin(() => apiRepository.toggleServiceCategory(id)),
    saveProductCategory: category => mutateAdmin(() => apiRepository.saveProductCategory({ id: category.id || 0, name: category.name, active: category.active !== false })),
    toggleProductCategory: id => mutateAdmin(() => apiRepository.toggleProductCategory(id)),
    saveSubcategory: (categoryId, subcategory) => mutateAdmin(() => apiRepository.saveSubcategory({ id: subcategory.id || 0, productCategoryId: categoryId, name: subcategory.name, active: subcategory.active !== false })),
    toggleSubcategory: (_categoryId, subcategoryId) => mutateAdmin(() => apiRepository.toggleSubcategory(subcategoryId)),

    getAvailability: (serviceId, date, preferredTime = '') => apiRepository.getAvailability(serviceId, date, preferredTime),
    async requestAppointment(appointment) {
      const result = await apiRepository.requestAppointment({
        serviceId: appointment.serviceId,
        date: appointment.date,
        time: appointment.time,
        fullName: appointment.fullName,
        phone: appointment.phone,
        notes: appointment.notes || ''
      })
      return result
    },
    saveAppointment: appointment => mutateAdmin(() => apiRepository.saveAppointment({
      serviceId: appointment.serviceId ?? null,
      workResourceId: appointment.workResourceId,
      date: appointment.date,
      time: appointment.time,
      durationMinutes: Number(appointment.durationMinutes) || 60,
      fullName: appointment.fullName || '',
      phone: appointment.phone || '',
      notes: appointment.notes || '',
      status: appointment.status
    })),
    setAppointmentStatus: (id, status) => mutateAdmin(() => apiRepository.setAppointmentStatus(id, status)),
    chargeAppointment: (id, payload) => mutateAdmin(() => apiRepository.chargeAppointment(id, payload)),

    saveSupplier: supplier => mutateAdmin(() => apiRepository.saveSupplier(supplier)),
    toggleSupplier: id => mutateAdmin(() => apiRepository.toggleSupplier(id)),
    registerPurchase: purchase => mutateAdmin(() => apiRepository.registerPurchase({
      supplierId: purchase.supplierId,
      invoiceNumber: purchase.invoiceNumber || '',
      paymentMethod: purchase.paymentMethod || 'Transferencia',
      notes: purchase.notes || '',
      items: purchase.items
    })),

    async createOrder(order) {
      const created = await apiRepository.createOrder(order)
      setCart([])
      return created
    },
    updateOrder: async (id, patch) => {
      if (patch.status !== 'cancelled') throw new Error('La API solo permite cancelar o confirmar pedidos.')
      return mutateAdmin(() => apiRepository.cancelOrder(id))
    },
    async confirmOrder(id, payload) {
      try {
        const order = await apiRepository.confirmOrder(id, {
          notes: payload.notes || '',
          items: payload.items.map(x => ({ productId: x.productId, quantity: Number(x.quantity), unitPrice: Number(x.unitPrice) }))
        })
        await refreshOrdersData()
        return { ok: true, order }
      } catch (err) { return { ok: false, error: err.message } }
    },
    async closeOrder(id, payload = {}) {
      try {
        const sale = await apiRepository.closeOrder(id, payload)
        await refresh(true)
        return { ok: true, sale }
      } catch (err) { return { ok: false, error: err.message } }
    },
    async confirmSale(payload) {
      try {
        const sale = await apiRepository.registerSale({
          source: 'pos', orderId: null,
          customerName: payload.customerName || 'Venta mostrador', phone: payload.phone || '',
          paymentMethod: payload.paymentMethod || 'Efectivo', notes: payload.notes || '',
          items: payload.items.map(x => ({ productId: x.productId, quantity: Number(x.quantity), unitPrice: x.unitPrice == null ? null : Number(x.unitPrice) }))
        })
        await refresh(true)
        return { ok: true, sale }
      } catch (err) { return { ok: false, error: err.message } }
    },
    registerCashMovement: payload => mutateAdmin(() => apiRepository.registerCashMovement(payload)),
    adjustStock: (productId, newStock, note) => mutateAdmin(() => apiRepository.adjustStock(productId, Number(newStock), note))
  }), [data, cart, error])

  if (!data && error) {
    return (
      <div className="api-error-screen">
        <div className="api-error-card">
          <strong>No se pudo conectar con AutoSpa #33</strong>
          <p>{error}</p>
          <button className="btn btn-primary" type="button" onClick={() => { setError(''); refresh(false).catch(() => {}) }}>Reintentar</button>
        </div>
      </div>
    )
  }

  return <AppDataContext.Provider value={api}>{children}</AppDataContext.Provider>
}

export const useAppData = () => useContext(AppDataContext)
