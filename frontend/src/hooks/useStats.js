import { useState, useEffect, useCallback } from 'react'
import { fetchStatsSummary } from '../api/stats'

export function useStats(params = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchStatsSummary(params)
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
