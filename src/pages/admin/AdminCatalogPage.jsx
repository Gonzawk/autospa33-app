import { useState } from 'react'
import { Edit3, Eye, EyeOff, Plus } from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'

function InlineEditor({ title, initialName='', onCancel, onSave }) {
  const [name, setName] = useState(initialName)
  return <div className="inline-editor"><strong>{title}</strong><input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Nombre"/><div><button className="btn btn-secondary" onClick={onCancel}>Cancelar</button><button className="btn btn-primary" onClick={() => name.trim() && onSave(name.trim())}>Guardar</button></div></div>
}

export default function AdminCatalogPage() {
  const api = useAppData()
  const { data, loading } = api
  const [tab, setTab] = useState('products')
  const [editor, setEditor] = useState(null)

  if (loading) return <div className="screen-loader">Cargando catálogo…</div>

  const saveEditor = async name => {
    if (editor.type === 'brand') await api.saveBrand({ id:editor.item?.id || 0, name, active:editor.item?.active ?? true })
    if (editor.type === 'serviceCategory') await api.saveServiceCategory({ id:editor.item?.id || 0, name, active:editor.item?.active ?? true })
    if (editor.type === 'productCategory') await api.saveProductCategory({ id:editor.item?.id || 0, name, active:editor.item?.active ?? true, subcategories:editor.item?.subcategories || [] })
    if (editor.type === 'subcategory') await api.saveSubcategory(editor.categoryId, { id:editor.item?.id || 0, name, active:editor.item?.active ?? true })
    setEditor(null)
  }

  return (
    <>
      <div className="admin-page-header"><div><span className="section-kicker">Administración</span><h1>Catálogo</h1><p>Marcas, categorías, subcategorías y categorías de servicios.</p></div></div>

      <div className="catalog-tabs">
        <button className={tab==='products'?'active':''} onClick={() => setTab('products')}>Categorías productos</button>
        <button className={tab==='brands'?'active':''} onClick={() => setTab('brands')}>Marcas</button>
        <button className={tab==='services'?'active':''} onClick={() => setTab('services')}>Categorías servicios</button>
      </div>

      {editor && <InlineEditor title={editor.title} initialName={editor.item?.name || ''} onCancel={() => setEditor(null)} onSave={saveEditor}/>}

      {tab === 'brands' && <div className="catalog-panel">
        <div className="panel-heading"><h2>Marcas</h2><button className="btn btn-primary" onClick={() => setEditor({type:'brand',title:'Nueva marca'})}><Plus size={16}/> Nueva</button></div>
        <div className="entity-list">{data.brands.map(x => <div className="entity-row" key={x.id}><div><strong>{x.name}</strong><span className={`status ${x.active?'active':'inactive'}`}>{x.active?'Activa':'Inactiva'}</span></div><div className="table-actions"><button onClick={() => setEditor({type:'brand',item:x,title:'Editar marca'})}><Edit3 size={16}/></button><button onClick={() => api.toggleBrand(x.id)}>{x.active?<EyeOff size={16}/>:<Eye size={16}/>}</button></div></div>)}</div>
      </div>}

      {tab === 'services' && <div className="catalog-panel">
        <div className="panel-heading"><h2>Categorías de servicios</h2><button className="btn btn-primary" onClick={() => setEditor({type:'serviceCategory',title:'Nueva categoría'})}><Plus size={16}/> Nueva</button></div>
        <div className="entity-list">{data.serviceCategories.map(x => <div className="entity-row" key={x.id}><div><strong>{x.name}</strong><span className={`status ${x.active?'active':'inactive'}`}>{x.active?'Activa':'Inactiva'}</span></div><div className="table-actions"><button onClick={() => setEditor({type:'serviceCategory',item:x,title:'Editar categoría'})}><Edit3 size={16}/></button><button onClick={() => api.toggleServiceCategory(x.id)}>{x.active?<EyeOff size={16}/>:<Eye size={16}/>}</button></div></div>)}</div>
      </div>}

      {tab === 'products' && <div className="category-admin-grid">
        <div className="panel-heading wide-heading"><h2>Categorías y subcategorías</h2><button className="btn btn-primary" onClick={() => setEditor({type:'productCategory',title:'Nueva categoría'})}><Plus size={16}/> Nueva categoría</button></div>
        {data.productCategories.map(category => <article className="category-admin-card" key={category.id}>
          <div className="category-card-head">
            <div><h3>{category.name}</h3><span className={`status ${category.active?'active':'inactive'}`}>{category.active?'Activa':'Inactiva'}</span></div>
            <div className="table-actions"><button onClick={() => setEditor({type:'productCategory',item:category,title:'Editar categoría'})}><Edit3 size={16}/></button><button onClick={() => api.toggleProductCategory(category.id)}>{category.active?<EyeOff size={16}/>:<Eye size={16}/>}</button></div>
          </div>
          <div className="subcategory-list">
            {category.subcategories.map(sub => <div key={sub.id}><span>{sub.name}</span><span className={`status ${sub.active?'active':'inactive'}`}>{sub.active?'Activa':'Inactiva'}</span><div className="table-actions"><button onClick={() => setEditor({type:'subcategory',categoryId:category.id,item:sub,title:'Editar subcategoría'})}><Edit3 size={15}/></button><button onClick={() => api.toggleSubcategory(category.id, sub.id)}>{sub.active?<EyeOff size={15}/>:<Eye size={15}/>}</button></div></div>)}
          </div>
          <button className="add-subcategory" onClick={() => setEditor({type:'subcategory',categoryId:category.id,title:`Nueva subcategoría en ${category.name}`})}><Plus size={15}/> Agregar subcategoría</button>
        </article>)}
      </div>}
    </>
  )
}
