import axios from 'axios'
import { getBackendURL } from '../../../util'

const backendUrl = getBackendURL()

const axiosInstance = axios.create({
  baseURL: backendUrl,
})

// Add a request interceptor to include the token in every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

export default axiosInstance
