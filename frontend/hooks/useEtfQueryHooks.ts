"use client"
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import queryClient from '@/lib/query/queryClient';
import etfService from '@/lib/api/etfService';
import { ReturnRateBySectorsResponse, ReturnRateBySectorsRequest } from '@/lib/api/etfService';

export const timeRangeValues = [1, 5, 10, 15] as const;
export type TimeRange = typeof timeRangeValues[number];

// 日期工具函数
const dateUtils = {
  // 获取当前日期（格式：YYYY-MM-DD）
  getToday: (): string => {
    return new Date().toISOString().split('T')[0];
  },
  
  // 根据时间范围计算开始日期
  calculateStartDate: (range: TimeRange, baseDate?: string): string => {
    const endDate = baseDate ? new Date(baseDate) : new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - range);
    return startDate.toISOString().split('T')[0];
  },
  
  // 检查日期是否是今天
  isToday: (date: string): boolean => {
    return date === dateUtils.getToday();
  }
};

// 缓存键管理
const cacheKeys = {
  // 主缓存键（按时间范围）
  sectorReturnRate: (range: TimeRange) => ['sectorReturnRate', range],
  
  // 日期标记键（用于检查数据新鲜度）
  dataFreshness: (range: TimeRange) => ['dataFreshness', range],
  
  // 所有ETF相关查询的通用键（用于批量失效）
  allEtfQueries: ['sectorReturnRate', 'availableSectors']
};

// 缓存持久化工具
const cachePersistence = {
  // 从 localStorage 读取缓存
  getFromStorage: <T>(key: string): T | null => {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(`etf-cache-${key}`);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  
  // 保存到 localStorage
  saveToStorage: (key: string, data: any, ttl: number = 24 * 60 * 60 * 1000): void => {
    if (typeof window === 'undefined') return;
    try {
      const item = {
        data,
        timestamp: Date.now(),
        expiry: Date.now() + ttl
      };
      localStorage.setItem(`etf-cache-${key}`, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to save cache to localStorage:', error);
    }
  },
  
  // 检查缓存是否有效
  isCacheValid: (key: string): boolean => {
    const cached = cachePersistence.getFromStorage(key);
    if (!cached) return false;
    return cached && typeof cached === 'object' && 'expiry' in cached && Date.now() < (cached as { expiry: number }).expiry;
  }
};

// 主查询 Hook - 智能缓存策略
export const useGetSectorReturnRate = (
  range: TimeRange,
  options?: {
    forceRefresh?: boolean;
    usePersistentCache?: boolean;
  }
): UseQueryResult<ReturnRateBySectorsResponse> & { 
  isFromCache: boolean 
} => {
  const { forceRefresh = false, usePersistentCache = true } = options || {};
  
  const endDate = dateUtils.getToday();
  const startDate = dateUtils.calculateStartDate(range, endDate);
  const queryKey = cacheKeys.sectorReturnRate(range);
  
  // 检查内存缓存
  const cachedData = queryClient.getQueryData(queryKey) as ReturnRateBySectorsResponse;
  
  // 检查持久化缓存
  const persistentCacheKey = `sector-${range}-${endDate}`;
  const shouldUsePersistentCache = usePersistentCache && 
    !forceRefresh && 
    cachePersistence.isCacheValid(persistentCacheKey);
  
  let initialData: ReturnRateBySectorsResponse | undefined;
  let isFromCache = false;
  
  if (shouldUsePersistentCache && !cachedData) {
    const persisted = cachePersistence.getFromStorage(persistentCacheKey);
    if (persisted) {
      initialData = (persisted as { data: ReturnRateBySectorsResponse }).data;
      isFromCache = true;
    }
  }
  
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const data = await etfService.getAllSectorsReturnRate(startDate, endDate, false);
      
      // 成功获取数据后，保存到持久化缓存（当天有效）
      if (usePersistentCache) {
        const ttl = 24 * 60 * 60 * 1000; // 24小时
        cachePersistence.saveToStorage(persistentCacheKey, data, ttl);
      }
      
      return data;
    },
    staleTime: 12 * 60 * 60 * 1000, // 12小时 - 当天数据不会过时
    gcTime: 24 * 60 * 60 * 1000,    // 24小时 - 缓存保留一天
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: forceRefresh,
    enabled: !initialData || forceRefresh, // 如果有初始数据且不需要强制刷新，则不立即执行
    initialData: initialData,
    
    // 智能重试策略
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    ...query,
    isFromCache: isFromCache && !query.isFetching
  };
};

// 批量预加载 Hook
export const usePreloadSectorReturnRates = () => {
  const preloadAllRanges = async () => {
    const promises = timeRangeValues.map(range => {
      const queryKey = cacheKeys.sectorReturnRate(range);
      
      // 如果已经有缓存，跳过预加载
      if (queryClient.getQueryData(queryKey)) {
        return Promise.resolve();
      }
      
      return queryClient.prefetchQuery({
        queryKey,
        queryFn: () => {
          const endDate = dateUtils.getToday();
          const startDate = dateUtils.calculateStartDate(range, endDate);
          return etfService.getAllSectorsReturnRate("2024-09-01", "2024-09-04", false);
        },
        staleTime: 12 * 60 * 60 * 1000,
        gcTime: 24 * 60 * 60 * 1000,
      });
    });
    
    await Promise.allSettled(promises);
  };
  
  return { preloadAllRanges };
};

// 增强的缓存管理
export const useEnhancedEtfCache = () => {
  const invalidateByRange = (range: TimeRange) => {
    queryClient.invalidateQueries({ 
      queryKey: cacheKeys.sectorReturnRate(range) 
    });
  };
  
  const invalidateAllRanges = () => {
    timeRangeValues.forEach(range => {
      queryClient.invalidateQueries({ 
        queryKey: cacheKeys.sectorReturnRate(range) 
      });
    });
  };
  
  // 清除过期的持久化缓存
  const cleanupExpiredCache = () => {
    if (typeof window === 'undefined') return;
    
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('etf-cache-')) {
        try {
          const item = JSON.parse(localStorage.getItem(key)!);
          if (Date.now() > item.expiry) {
            localStorage.removeItem(key);
          }
        } catch {
          localStorage.removeItem(key);
        }
      }
    });
  };
  
  // 获取缓存状态
  const getCacheStatus = () => {
    return timeRangeValues.map(range => {
      const queryKey = cacheKeys.sectorReturnRate(range);
      const memoryCache = queryClient.getQueryData(queryKey);
      const persistentCacheKey = `sector-${range}-${dateUtils.getToday()}`;
      const persistentCache = cachePersistence.isCacheValid(persistentCacheKey);
      
      return {
        range,
        memoryCache: !!memoryCache,
        persistentCache,
        lastUpdated: memoryCache ? 'memory' : persistentCache ? 'storage' : 'none'
      };
    });
  };

  return {
    invalidateByRange,
    invalidateAllRanges,
    cleanupExpiredCache,
    getCacheStatus
  };
};
