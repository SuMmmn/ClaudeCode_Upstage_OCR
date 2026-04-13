import axiosInstance from './axiosInstance'

export const uploadReceipt = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return axiosInstance.post('/api/receipts/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000, // OCR 분석 시간 고려
  })
}

export const fetchReceipts = (params = {}) =>
  axiosInstance.get('/api/receipts', { params })

export const fetchReceipt = (id) =>
  axiosInstance.get(`/api/receipts/${id}`)

export const updateReceipt = (id, data) =>
  axiosInstance.put(`/api/receipts/${id}`, data)

export const deleteReceipt = (id) =>
  axiosInstance.delete(`/api/receipts/${id}`)

export const fetchCategories = () =>
  axiosInstance.get('/api/categories')
