import axios, { AxiosInstance, AxiosError } from 'axios';
import { toast } from 'sonner';

// 定义API响应的通用接口
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  code: number;
  message: string;
  data?: T;
  errors?: any;
}

// 创建axios实例
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证token等
apiClient.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 统一处理错误和成功响应
apiClient.interceptors.response.use(
  (response) => {
    // 直接返回响应数据，因为我们在service层会进一步处理
    return response;
  },
  (error: AxiosError<ApiResponse>) => {
    // 处理错误响应
    let errorMessage = '发生未知错误';
    
    if (error.response) {
      // 服务器返回了错误状态码
      const apiError = error.response.data;
      if (apiError && apiError.message) {
        errorMessage = apiError.message;
      } else if (error.response.status === 401) {
        errorMessage = '未授权，请重新登录';
        // 可以在这里处理登出逻辑
      } else if (error.response.status === 403) {
        errorMessage = '没有权限执行此操作';
      } else if (error.response.status === 404) {
        errorMessage = '请求的资源不存在';
      } else if (error.response.status >= 500) {
        errorMessage = '服务器内部错误';
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      errorMessage = '网络错误，请检查您的连接';
    } else {
      // 请求配置出错
      errorMessage = error.message;
    }
    
    // 使用sonner显示错误消息
    toast.error(errorMessage);
    
    // 继续抛出错误，以便在组件中可以进一步处理
    return Promise.reject(error);
  }
);

// 封装常用的请求方法
export const api = {
  get: <T = any>(url: string, config?: any) => 
    apiClient.get<ApiResponse<T>>(url, config).then(res => res.data),
  
  post: <T = any>(url: string, data?: any, config?: any) => 
    apiClient.post<ApiResponse<T>>(url, data, config).then(res => res.data),
  
  put: <T = any>(url: string, data?: any, config?: any) => 
    apiClient.put<ApiResponse<T>>(url, data, config).then(res => res.data),
  
  patch: <T = any>(url: string, data?: any, config?: any) => 
    apiClient.patch<ApiResponse<T>>(url, data, config).then(res => res.data),
  
  delete: <T = any>(url: string, config?: any) => 
    apiClient.delete<ApiResponse<T>>(url, config).then(res => res.data),
};

export default apiClient;