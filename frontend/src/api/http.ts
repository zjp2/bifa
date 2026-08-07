import axios, { type AxiosInstance } from 'axios'

// 后端基础地址：开发环境通过 Vite 代理转发到 localhost:3001
const BASE_URL = '/api'

/** 全局 axios 实例，自动注入 JWT */
const http: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// 请求拦截器：自动附加 Authorization 头
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('inkwell_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// 响应拦截器：401 时清除登录态
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('inkwell_token')
      localStorage.removeItem('inkwell_user')
      // 不在拦截器里强跳路由，交给路由守卫处理
    }
    return Promise.reject(error)
  },
)

export default http
