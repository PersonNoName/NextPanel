"use client";
import { useQuery, useMutation, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import queryClient from '@/lib/query/queryClient';
import userService, { User, LoginRequest, LoginResponse } from '@/lib/api/userService';

// 获取当前用户信息的hook
export const useGetCurrentUser = (): UseQueryResult<User> => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => userService.getCurrentUser(),
    staleTime: 10 * 60 * 1000, // 10分钟
    retry: 1,
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
      // 存储token
      localStorage.setItem('authToken', data.token);
    },
  });
};

// 用户登出的mutation hook
export const useLogout = (): UseMutationResult<void, Error> => {
  return useMutation({
    mutationFn: () => userService.logout(),
    onSuccess: () => {
      // 清除token
      localStorage.removeItem('authToken');
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