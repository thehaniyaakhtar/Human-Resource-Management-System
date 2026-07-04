import api from './auth'

export const listEmployees = (q = '') =>
  api.get('/employees', { params: q ? { q } : {} })

export const getEmployee = (id) => api.get(`/employees/${id}`)

export const createEmployee = (data) => api.post('/auth/employees', data)
