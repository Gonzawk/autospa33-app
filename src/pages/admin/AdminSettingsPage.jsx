import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import BrandLogo from '../../components/BrandLogo'
import { useAppData } from '../../context/AppDataContext'

export default function AdminSettingsPage() {
  const { data, loading, saveSettings } = useAppData()
  const [form, setForm] = useState(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => { if (data) setForm(data.settings) }, [data])
  if (loading || !form) return <div className="screen-loader">Cargando configuración…</div>

  const submit = async e => {
    e.preventDefault()
    await saveSettings(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  return (
    <>
      <div className="admin-page-header"><div><span className="section-kicker">Administración</span><h1>Configuración</h1><p>Información general y comportamiento visible del sitio.</p></div></div>

      <div className="settings-layout">
        <aside className="settings-brand-card">
          <BrandLogo/>
          <h2>{form.displayName}</h2>
          <p>{form.tagline}</p>
          <small>Nombre técnico recomendado: <strong>{form.technicalName}</strong></small>
          <small>Dominio: <strong>{form.domain}</strong></small>
        </aside>

        <form className="settings-form" onSubmit={submit}>
          <section className="settings-section">
            <h2>Identidad</h2>
            <div className="form-grid"><label><span>Nombre visible</span><input value={form.displayName} onChange={e => setForm({...form,displayName:e.target.value})}/></label><label><span>Nombre técnico</span><input value={form.technicalName} onChange={e => setForm({...form,technicalName:e.target.value})}/></label></div>
            <div className="form-grid"><label><span>Tagline</span><input value={form.tagline} onChange={e => setForm({...form,tagline:e.target.value})}/></label><label><span>Dominio</span><input value={form.domain} onChange={e => setForm({...form,domain:e.target.value})}/></label></div>
            <label><span>Título principal</span><input value={form.heroTitle} onChange={e => setForm({...form,heroTitle:e.target.value})}/></label>
            <label><span>Descripción principal</span><textarea value={form.heroSubtitle} onChange={e => setForm({...form,heroSubtitle:e.target.value})}/></label>
          </section>

          <section className="settings-section">
            <h2>Contacto</h2>
            <div className="form-grid"><label><span>Teléfono</span><input value={form.phone} onChange={e => setForm({...form,phone:e.target.value})}/></label><label><span>WhatsApp técnico</span><input value={form.whatsapp} onChange={e => setForm({...form,whatsapp:e.target.value})}/></label></div>
            <div className="form-grid"><label><span>Email</span><input value={form.email} onChange={e => setForm({...form,email:e.target.value})}/></label><label><span>Instagram</span><input value={form.instagram} onChange={e => setForm({...form,instagram:e.target.value})}/></label></div>
            <label><span>Dirección / ubicación</span><input value={form.address} onChange={e => setForm({...form,address:e.target.value})}/></label>
            <label><span>Horario comercial</span><input value={form.businessHours} onChange={e => setForm({...form,businessHours:e.target.value})}/></label>
            <label><span>Mensaje de entrega/retiro</span><input value={form.storePickupMessage || ''} onChange={e => setForm({...form,storePickupMessage:e.target.value})}/></label>
          </section>

          <section className="settings-section">
            <h2>Precios y redondeo comercial</h2>
            <p className="settings-help">El precio automático se calcula aplicando los porcentajes en orden y luego se redondea al múltiplo elegido. Para proteger el margen recomendamos redondear hacia arriba.</p>
            <div className="form-grid">
              <label><span>Múltiplo de redondeo</span><select value={form.priceRoundingStep || 500} onChange={e=>setForm({...form,priceRoundingStep:Number(e.target.value)})}><option value={1}>Sin redondeo</option><option value={10}>$10</option><option value={50}>$50</option><option value={100}>$100</option><option value={500}>$500</option><option value={1000}>$1.000</option></select><small className="field-hint">Ej.: con $500, $16.417 puede quedar en $16.500.</small></label>
              <label><span>Modo de redondeo</span><select value={form.priceRoundingMode || 'up'} onChange={e=>setForm({...form,priceRoundingMode:e.target.value})}><option value="up">Hacia arriba</option><option value="nearest">Al más cercano</option><option value="down">Hacia abajo</option></select><small className="field-hint">“Hacia arriba” evita perder margen por el redondeo.</small></label>
            </div>
          </section>

          <section className="settings-section">
            <h2>Agenda y turnos</h2>
            <p className="settings-help">Definí los días y la franja horaria que utiliza la disponibilidad pública de turnos.</p>
            <div className="working-days-editor">
              {[['1','Lun'],['2','Mar'],['3','Mié'],['4','Jue'],['5','Vie'],['6','Sáb'],['0','Dom']].map(([value,label]) => {
                const days = String(form.appointmentWorkingDays || '').split(',').filter(Boolean)
                return <label key={value}><input type="checkbox" checked={days.includes(value)} onChange={e => { const next = e.target.checked ? [...days,value] : days.filter(x => x !== value); setForm({...form,appointmentWorkingDays:next.sort((a,b) => Number(a)-Number(b)).join(',')}) }}/><span>{label}</span></label>
              })}
            </div>
            <div className="form-grid">
              <label><span>Hora de inicio</span><input type="time" value={String(form.appointmentStartTime || '08:30').slice(0,5)} onChange={e => setForm({...form,appointmentStartTime:`${e.target.value}:00`})}/></label>
              <label><span>Hora de cierre</span><input type="time" value={String(form.appointmentEndTime || '19:00').slice(0,5)} onChange={e => setForm({...form,appointmentEndTime:`${e.target.value}:00`})}/></label>
            </div>
            <label><span>Intervalo entre inicios de turno</span><select value={form.appointmentSlotIntervalMinutes || 30} onChange={e => setForm({...form,appointmentSlotIntervalMinutes:Number(e.target.value)})}><option value={15}>15 minutos</option><option value={30}>30 minutos</option><option value={45}>45 minutos</option><option value={60}>60 minutos</option></select></label>
          </section>

          <section className="settings-section">
            <h2>Opciones del sitio</h2>
            <div className="settings-toggles">
              <label><input type="checkbox" checked={form.storeEnabled} onChange={e => setForm({...form,storeEnabled:e.target.checked})}/><span><strong>Store habilitada</strong><small>Muestra la tienda al cliente.</small></span></label>
              <label><input type="checkbox" checked={form.bookingsEnabled} onChange={e => setForm({...form,bookingsEnabled:e.target.checked})}/><span><strong>Turnos habilitados</strong><small>Muestra acciones para solicitar turnos.</small></span></label>
              <label><input type="checkbox" checked={form.showPrices} onChange={e => setForm({...form,showPrices:e.target.checked})}/><span><strong>Mostrar precios</strong><small>Si se desactiva se muestra “Consultar”.</small></span></label>
              <label><input type="checkbox" checked={form.ordersEnabled !== false} onChange={e => setForm({...form,ordersEnabled:e.target.checked})}/><span><strong>Pedidos por WhatsApp</strong><small>Permite armar carrito y enviar solicitudes sin cobro online.</small></span></label>
            </div>
          </section>

          <button className="btn btn-primary settings-save"><Save size={17}/> {saved ? 'Guardado' : 'Guardar configuración'}</button>
        </form>
      </div>
    </>
  )
}
