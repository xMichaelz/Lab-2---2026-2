import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
})

api.interceptors.request.use((config) => {
  if (config.data && !config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json'
  }
  return config
})

export function getErrorMessage(error, fallback = 'Ocurrió un error inesperado.') {
  return error?.response?.data?.message || error?.message || fallback
}

export default api
