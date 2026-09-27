import { Instagram, Mail, MapPin, MessageCircle } from 'lucide-react'
import BrandLogo from './BrandLogo'
import { useAppData } from '../context/AppDataContext'

export default function Footer() {
  const { data } = useAppData()
  if (!data) return null

  const s = data.settings
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="footer-brand">
            <BrandLogo compact />
          </div>
          <p>{s.heroSubtitle}</p>
          <small className="domain-label">{s.domain}</small>
        </div>
        <div className="footer-contact">
          <span><MapPin size={17}/> {s.address}</span>
          <span><MessageCircle size={17}/> {s.phone}</span>
          <span><Mail size={17}/> {s.email}</span>
          <span><Instagram size={17}/> {s.instagram}</span>
        </div>
      </div>
    </footer>
  )
}
