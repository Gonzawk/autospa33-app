import logo from '../assets/autospa33-logo-horizontal.jpeg'

export default function BrandLogo({ compact = false }) {
  const frameStyle = compact
    ? {
        width: '118px',
        height: '44px',
        borderRadius: '10px',
        background: '#000',
        padding: '4px 7px',
        boxShadow: '0 8px 22px rgba(0,0,0,.12)',
      }
    : {
        width: '220px',
        height: '82px',
        borderRadius: '16px',
        background: '#000',
        padding: '7px 10px',
        boxShadow: '0 12px 30px rgba(0,0,0,.14)',
      }

  return (
    <span
      className={`brand-logo ${compact ? 'brand-logo-compact' : ''}`}
      style={{
        ...frameStyle,
        overflow: 'hidden',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: '0 0 auto',
        border: '1px solid rgba(255,255,255,.08)',
      }}
    >
      <img
        src={logo}
        alt="AutoSpa #33 - Detailing Store"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          objectPosition: 'center',
          padding: 0,
        }}
      />
    </span>
  )
}
