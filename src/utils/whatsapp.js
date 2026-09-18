export const normalizeWhatsappNumber = value => String(value || '').replace(/\D/g, '')

export const buildWhatsappUrl = (phone, message) => {
  const number = normalizeWhatsappNumber(phone)
  if (!number) return ''
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}
