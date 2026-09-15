import logo from '../assets/autospa33-logo.webp'

export default function BrandLogo({ compact = false }) {
  return (
    <span className={`brand-logo ${compact ? 'brand-logo-compact' : ''}`}>
      <img src={logo} alt="AutoSpa #33" />
    </span>
  )
}
