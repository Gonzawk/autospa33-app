export function Pagination({ page, totalPages, totalItems, onPageChange }) {
  if (!totalItems || totalPages <= 1) return null
  return (
    <nav className="admin-pagination" aria-label="Paginación">
      <button className="btn btn-secondary compact-btn" type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Anterior</button>
      <span>Página <strong>{page}</strong> de <strong>{totalPages}</strong> · {totalItems} registros</span>
      <button className="btn btn-secondary compact-btn" type="button" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Siguiente</button>
    </nav>
  )
}
