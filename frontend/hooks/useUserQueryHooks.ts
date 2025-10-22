"use client";
import { useQuery, useMutation, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import queryClient from '@/lib/query/queryClient';
import userService, { User, LoginRequest, LoginResponse } from '@/lib/api/userService';
import { toast } from 'sonner';

// 获取当前用户信息的hook
export const useGetCurrentUser = (): UseQueryResult<User> => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => userService.getCurrentUser(),
    staleTime: 24 * 60 * 60 * 1000, // 24小时
    gcTime: 24 * 60 * 60 * 1000, // 缓存保留24小时
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false, // 关键：组件挂载时不重新获取
    refetchOnReconnect: false,
  });
};

// 获取用户列表的hook
export const useGetUsers = (params?: {
  page?: number;
  limit?: number;
}): UseQueryResult<{ users: User[]; total: number }> => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => userService.getUsers(params),
    staleTime: 5 * 60 * 1000, // 5分钟
    retry: 1,
  });
};

// 获取单个用户信息的hook
export const useGetUserById = (id: string): UseQueryResult<User> => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getUserById(id),
    staleTime: 5 * 60 * 1000, // 5分钟
    retry: 1,
    enabled: !!id, // 只有在id存在时才执行查询
  });
};

// 用户登录的mutation hook
export const useLogin = (): UseMutationResult<LoginResponse, Error, LoginRequest> => {
  return useMutation({
    mutationFn: (credentials) => userService.login(credentials),
    onSuccess: (data) => {
      // 存储token到localStorage
      localStorage.setItem('authToken', data.token);
      
      // 同时存储到cookie，以便middleware可以读取
      // 注意：在客户端JavaScript中，HttpOnly标志会被忽略
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 7);
      document.cookie = `authToken=${data.token}; path=/; expires=${expirationDate.toUTCString()}; SameSite=Lax`;
      
      // 显示成功提示
      toast.success('登录成功！');
    },
  });
};

// 用户登出的mutation hook
// 用户登出的mutation hook
export const useLogout = (): UseMutationResult<void, Error> => {
  return useMutation({
    mutationFn: () => userService.logout(),
    onMutate: async () => {
      // 清除localStorage中的token
      localStorage.removeItem('authToken');
      
      // 更彻底的清除cookie策略
      const domains = [window.location.hostname, '.', window.location.hostname.split('.').slice(-2).join('.')];
      const paths = ['/', '/login', '/dashboard', '/api'];
      const dates = [
        'Thu, 01 Jan 1970 00:00:00 UTC',
        'Thu, 01 Jan 1970 00:00:00 GMT'
      ];

      // 清除所有可能的cookie组合
      domains.forEach(domain => {
        paths.forEach(path => {
          dates.forEach(date => {
            document.cookie = `authToken=; domain=${domain}; path=${path}; expires=${date};`;
            document.cookie = `authToken=; path=${path}; expires=${date};`;
          });
        });
      });

      // 清除所有用户相关的查询缓存
      queryClient.removeQueries({ queryKey: ['currentUser'] });
      queryClient.removeQueries({ queryKey: ['users'] });
      queryClient.removeQueries({ queryKey: ['user'] });
      
      // 强制清除queryClient的缓存
      await queryClient.cancelQueries();
      queryClient.clear();
    },
    
    onSettled: () => {
      // 显示登出成功提示
      toast.success('登出成功！');
      
      // 使用更可靠的重定向方式
      setTimeout(() => {
        // 强制刷新页面确保所有状态被重置
        window.location.href = '/login';
        // 或者使用 replace
        // window.location.replace('/login');
      }, 150);
    },
  });
};

// 更新用户信息的mutation hook
export const useUpdateProfile = (): UseMutationResult<User, Error, Partial<User>> => {
  return useMutation({
    mutationFn: (userData) => userService.updateProfile(userData),
    onSuccess: (data, variables, context) => {
      // 成功后更新缓存
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
};

// 创建用户的mutation hook
export const useCreateUser = (): UseMutationResult<User, Error, Omit<User, 'id' | 'createdAt' | 'updatedAt'>> => {
  return useMutation({
    mutationFn: (userData) => userService.createUser(userData),
    onSuccess: () => {
      // 成功后更新用户列表缓存
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// 更新用户的mutation hook
export const useUpdateUser = (): UseMutationResult<User, Error, { id: string; data: Partial<User> }> => {
  return useMutation({
    mutationFn: ({ id, data }) => userService.updateUser(id, data),
    onSuccess: (data, variables) => {
      // 成功后更新相关缓存
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
    },
  });
};

// 删除用户的mutation hook
export const useDeleteUser = (): UseMutationResult<void, Error, string> => {
  return useMutation({
    mutationFn: (id) => userService.deleteUser(id),
    onSuccess: (data, variables) => {
      // 成功后更新用户列表缓存
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}