"use client";

import { useQuery, useQueries, UseQueryResult } from '@tanstack/react-query';
import queryClient from '@/lib/query/queryClient';
import etfService, { ReturnRateBySectorsResponse } from '@/lib/api/etfService';

// ==================== 类型定义 ====================
export const timeRangeValues = [1, 5, 10, 15] as const;
export type TimeRange = (typeof timeRangeValues)[number];

interface DateRange {
  startDate: string;
  endDate: string;
}

// ==================== 日期工具 ====================
const dateUtils = {
  getToday: (): string => {
    return new Date().toISOString().split('T')[0];
  },

  calculateDateRange: (days: TimeRange): DateRange => {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);
    
    // return {
    //   startDate: startDate.toISOString().split('T')[0],
    //   endDate: endDate.toISOString().split('T')[0],
    // };
    return {
      startDate: '2024-07-01',
      endDate: '2024-07-04',
    }
  },
};

// ==================== 查询键工厂 ====================
export const sectorReturnRateKeys = {
  all: ['sectorReturnRate'] as const,
  byRange: (range: TimeRange, dateRange: DateRange) => 
    [...sectorReturnRateKeys.all, range, dateRange] as const,
};

// ==================== 主 Hook ====================
/**
 * 获取指定时间范围的类别收益率数据
 * 
 * @param range - 时间范围（天数）
 * @param options - 查询配置选项
 * @returns 查询结果
 */
export const useSectorReturnRate = (
  range: TimeRange,
  options?: {
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
  }
): UseQueryResult<ReturnRateBySectorsResponse> => {
  const dateRange = dateUtils.calculateDateRange(range);
  const { enabled = true, refetchOnWindowFocus = false } = options || {};

  return useQuery({
    queryKey: sectorReturnRateKeys.byRange(range, dateRange),
    queryFn: async () => {
      const data = await etfService.getAllSectorsReturnRate(
        dateRange.startDate,
        dateRange.endDate,
        false
      );
      return data;
    },
    staleTime: 1000 * 60 * 60 * 12, // 12小时内认为数据新鲜
    gcTime: 1000 * 60 * 60 * 24, // 24小时后从缓存中移除
    refetchOnWindowFocus,
    refetchOnMount: false, // 避免组件重新挂载时重复请求
    enabled,
  });
};

// ==================== 批量查询 Hook ====================
/**
 * 同时获取多个时间范围的收益率数据
 * 
 * @param ranges - 要查询的时间范围数组
 * @returns 查询结果数组
 */
export const useSectorReturnRates = (
  ranges: readonly TimeRange[] = timeRangeValues
) => {
  const queries = ranges.map((range) => {
    const dateRange = dateUtils.calculateDateRange(range);
    
    return {
      queryKey: sectorReturnRateKeys.byRange(range, dateRange),
      queryFn: async () => {
        const data = await etfService.getAllSectorsReturnRate(
          dateRange.startDate,
          dateRange.endDate,
          false
        );
        return data;
      },
      staleTime: 1000 * 60 * 60 * 12,
      gcTime: 1000 * 60 * 60 * 24,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    };
  });

  return useQueries({ queries });
};

// ==================== 预加载工具 ====================
/**
 * 预加载所有时间范围的数据
 * 适合在应用初始化或路由切换时使用
 */
export const prefetchAllSectorReturnRates = async () => {
  const promises = timeRangeValues.map((range) => {
    const dateRange = dateUtils.calculateDateRange(range);
    const queryKey = sectorReturnRateKeys.byRange(range, dateRange);
    
    // 检查是否已有缓存
    const existingData = queryClient.getQueryData(queryKey);
    if (existingData) {
      return Promise.resolve(existingData);
    }

    return queryClient.prefetchQuery({
      queryKey,
      queryFn: async () => {
        const data = await etfService.getAllSectorsReturnRate(
          dateRange.startDate,
          dateRange.endDate,
          false
        );
        return data;
      },
      staleTime: 1000 * 60 * 60 * 12,
      gcTime: 1000 * 60 * 60 * 24,
    });
  });

  return Promise.allSettled(promises);
};

// ==================== 缓存管理工具 ====================
/**
 * 缓存管理 Hook
 */
export const useSectorReturnRateCache = () => {
  /**
   * 使指定时间范围的缓存失效
   */
  const invalidateRange = async (range: TimeRange) => {
    const dateRange = dateUtils.calculateDateRange(range);
    await queryClient.invalidateQueries({
      queryKey: sectorReturnRateKeys.byRange(range, dateRange),
    });
  };

  /**
   * 使所有时间范围的缓存失效
   */
  const invalidateAll = async () => {
    await queryClient.invalidateQueries({
      queryKey: sectorReturnRateKeys.all,
    });
  };

  /**
   * 清除指定时间范围的缓存
   */
  const removeRange = (range: TimeRange) => {
    const dateRange = dateUtils.calculateDateRange(range);
    queryClient.removeQueries({
      queryKey: sectorReturnRateKeys.byRange(range, dateRange),
    });
  };

  /**
   * 清除所有缓存
   */
  const removeAll = () => {
    queryClient.removeQueries({
      queryKey: sectorReturnRateKeys.all,
    });
  };

  /**
   * 获取所有范围的缓存状态
   */
  const getCacheStatus = () => {
    return timeRangeValues.map((range) => {
      const dateRange = dateUtils.calculateDateRange(range);
      const queryKey = sectorReturnRateKeys.byRange(range, dateRange);
      const state = queryClient.getQueryState(queryKey);

      return {
        range,
        dateRange,
        isCached: !!state?.data,
        isStale: state?.isInvalidated ?? true,
        dataUpdatedAt: state?.dataUpdatedAt,
        lastFetchedAt: state?.dataUpdatedAt 
          ? new Date(state.dataUpdatedAt).toLocaleString()
          : null,
      };
    });
  };

  /**
   * 手动设置缓存数据（用于服务端预取等场景）
   */
  const setQueryData = (range: TimeRange, data: ReturnRateBySectorsResponse) => {
    const dateRange = dateUtils.calculateDateRange(range);
    queryClient.setQueryData(
      sectorReturnRateKeys.byRange(range, dateRange),
      data
    );
  };

  return {
    invalidateRange,
    invalidateAll,
    removeRange,
    removeAll,
    getCacheStatus,
    setQueryData,
  };
};

// ==================== 便捷 Hook ====================
/**
 * 预加载 Hook - 用于组件中触发预加载
 */
export const usePreloadSectorReturnRates = () => {
  const preload = async () => {
    return prefetchAllSectorReturnRates();
  };

  return { preload };
};