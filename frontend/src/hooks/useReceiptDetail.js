import { useState, useEffect } from 'react'
import { fetchReceipt, updateReceipt, deleteReceipt } from '../api/receipts'

export function useReceiptDetail(id) {
  const [receipt, setReceipt] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetchReceipt(id)
      .then((res) => setReceipt(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  const update = async (data) => {
    const res = await updateReceipt(id, data)
    setReceipt(res.data)
    return res.data
  }

  const remove = () => deleteReceipt(id)

  return { receipt, loading, error, update, remove }
}
