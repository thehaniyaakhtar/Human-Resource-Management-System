import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hrms_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const hrSignUp = (data) => api.post('/auth/hr/signup', data)
export const signIn = (login_id, password) => api.post('/auth/signin', { login_id, password })
export const changePassword = (data) => api.post('/auth/change-password', data)
export const getMe = () => api.get('/auth/me')

export default api
