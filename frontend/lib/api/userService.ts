import BaseService from './services';
import { ApiResponse } from './apiclient';

// 用户接口定义
export interface User {
  id: number; // 改为数字类型，匹配后端
  username: string;
  email: string;
  password?: null; // 明确后端返回的 null 类型（或用 string | null 更灵活）
  createdAt?: string; // 后端已返回，可去掉 ? 改为必填，更准确
  updatedAt?: string; // 同理，可改为必填
  deletedAt?: null; // 后端返回的字段，声明为 null 类型
}

// 登录请求接口
export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

// 登录响应接口
export interface LoginResponse {
  token: string;
  user: User;
}

// 用户服务类
class UserService extends BaseService {
  constructor() {
    super('/');
  }

  /**
   * 用户登录
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.post<LoginResponse>('/auth/login', credentials);
  }

  /**
   * 用户登出
   */
  async logout(): Promise<void> {
    return this.post('/auth/logout');
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<User> {
    return this.get<User>('/auth/me');
  }

  /**
   * 更新用户信息
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    return this.put<User>('/profile', data);
  }

  /**
   * 获取用户列表
   */
  async getUsers(params?: {
    page?: number;
    limit?: number;
  }): Promise<{ users: User[]; total: number }> {
    return this.get<{ users: User[]; total: number }>('', params);
  }

  /**
   * 获取单个用户信息
   */
  async getUserById(id: string): Promise<User> {
    return this.get<User>(`/${id}`);
  }

  /**
   * 创建用户
   */
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    return this.post<User>('/auth/register', userData);
  }

  /**
   * 更新用户
   */
  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    return this.put<User>(`/${id}`, userData);
  }

  /**
   * 删除用户
   */
  async deleteUser(id: string): Promise<void> {
    return this.delete(`/${id}`);
  }
}

// 导出单例
export default new UserService();