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

export const signIn = (email, password) =>
  api.post('/auth/signin', { email, password })

export const signUp = (data) =>
  api.post('/auth/signup', data)

export const getMe = () =>
  api.get('/auth/me')

export default api
