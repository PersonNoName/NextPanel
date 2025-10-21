import { api } from './apiclient';

// 基础服务类
class BaseService {
  protected baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * 处理API响应，返回数据或抛出错误
   */
  protected async handleResponse<T>(apiCall: Promise<any>): Promise<T> {
    try {
      const response = await apiCall;
      
      if (response.status === 'success') {
        return response.data as T;
      } else {
        // 如果响应状态是error，抛出错误
        throw new Error(response.message || '请求失败');
      }
    } catch (error) {
      // 这里的错误会被apiclient的拦截器处理并显示toast
      // 重新抛出以便组件可以进一步处理
      throw error;
    }
  }

  /**
   * GET请求
   */
  async get<T>(endpoint: string = '', params?: any): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.handleResponse<T>(api.get(url, { params }));
  }

  /**
   * POST请求
   */
  async post<T>(endpoint: string = '', data?: any): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.handleResponse<T>(api.post(url, data));
  }

  /**
   * PUT请求
   */
  async put<T>(endpoint: string = '', data?: any): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.handleResponse<T>(api.put(url, data));
  }

  /**
   * PATCH请求
   */
  async patch<T>(endpoint: string = '', data?: any): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.handleResponse<T>(api.patch(url, data));
  }

  /**
   * DELETE请求
   */
  async delete<T>(endpoint: string = ''): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.handleResponse<T>(api.delete(url));
  }

  /**
   * 构建完整的URL
   */
  private buildUrl(endpoint: string): string {
    if (!endpoint) return this.baseUrl;
    
    const baseHasTrailingSlash = this.baseUrl.endsWith('/');
    const endpointHasLeadingSlash = endpoint.startsWith('/');
    
    if (baseHasTrailingSlash && endpointHasLeadingSlash) {
      return this.baseUrl + endpoint.slice(1);
    } else if (!baseHasTrailingSlash && !endpointHasLeadingSlash && endpoint) {
      return this.baseUrl + '/' + endpoint;
    }
    
    return this.baseUrl + endpoint;
  }
}

export default BaseService;