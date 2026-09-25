import { useEffect, useMemo, useState } from 'react'

export function usePagination(items = [], pageSize = 20, resetKeys = []) {
  const [page, setPage] = useState(1)
  useEffect(() => setPage(1), resetKeys) // eslint-disable-line react-hooks/exhaustive-deps
  const totalItems = items.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  useEffect(() => { if (page > totalPages) setPage(totalPages) }, [page, totalPages])
  const pageItems = useMemo(() => items.slice((page - 1) * pageSize, page * pageSize), [items, page, pageSize])
  return { page, setPage, pageSize, pageItems, totalItems, totalPages, hasPreviousPage: page > 1, hasNextPage: page < totalPages }
}
