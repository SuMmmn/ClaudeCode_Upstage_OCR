import { useState, useEffect, useCallback } from 'react'
import { fetchReceipts } from '../api/receipts'

export function useReceipts(params = {}) {
  const [data, setData] = useState({ total: 0, page: 1, limit: 20, items: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchReceipts(params)
      setData(res.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)])

  useEffect(() => { load() }, [load])

  return { data, loading, error, refetch: load }
}
