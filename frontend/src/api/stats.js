import axiosInstance from './axiosInstance'

export const fetchStatsSummary = (params = {}) =>
  axiosInstance.get('/api/stats/summary', { params })
