"use client"
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import queryClient from '@/lib/query/queryClient';
import etfService from '@/lib/api/etfService';
import { ReturnRateBySectorsResponse, ReturnRateBySectorsRequest } from '@/lib/api/etfService';

export const timeRangeValues = [1, 5, 10, 15] as const;
export type TimeRange = typeof timeRangeValues[number];

// 持久化缓存数据结构
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

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
  sectorReturnRate: (range: TimeRange) => ['sectorReturnRate', range] as const,
  
  // 日期标记键（用于检查数据新鲜度）
  dataFreshness: (range: TimeRange) => ['dataFreshness', range] as const,
  
  // 所有ETF相关查询的通用键（用于批量失效）
  allEtfQueries: ['sectorReturnRate', 'availableSectors'] as const
};

// 缓存持久化工具
const cachePersistence = {
  // 从 localStorage 读取缓存
  getFromStorage: <T>(key: string): CacheItem<T> | null => {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(`etf-cache-${key}`);
      if (!item) return null;
      
      const parsed = JSON.parse(item) as CacheItem<T>;
      
      // 验证数据结构
      if (!parsed.data || !parsed.expiry || !parsed.timestamp) {
        localStorage.removeItem(`etf-cache-${key}`);
        return null;
      }
      
      return parsed;
    } catch (error) {
      console.warn('Failed to read cache from localStorage:', error);
      // 清除损坏的缓存
      try {
        localStorage.removeItem(`etf-cache-${key}`);
      } catch {}
      return null;
    }
  },
  
  // 保存到 localStorage
  saveToStorage: <T>(key: string, data: T, ttl: number = 24 * 60 * 60 * 1000): void => {
    if (typeof window === 'undefined') return;
    try {
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiry: Date.now() + ttl
      };
      localStorage.setItem(`etf-cache-${key}`, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to save cache to localStorage:', error);
      // 如果存储失败（可能是空间不足），尝试清理过期缓存后重试
      cachePersistence.cleanupExpired();
      try {
        const item: CacheItem<T> = {
          data,
          timestamp: Date.now(),
          expiry: Date.now() + ttl
        };
        localStorage.setItem(`etf-cache-${key}`, JSON.stringify(item));
      } catch {
        // 仍然失败则放弃
      }
    }
  },
  
  // 检查缓存是否有效
  isCacheValid: (key: string): boolean => {
    const cached = cachePersistence.getFromStorage(key);
    if (!cached) return false;
    return Date.now() < cached.expiry;
  },
  
  // 清理过期缓存
  cleanupExpired: (): void => {
    if (typeof window === 'undefined') return;
    
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('etf-cache-')) {
          try {
            const item = localStorage.getItem(key);
            if (item) {
              const parsed = JSON.parse(item);
              if (parsed.expiry && Date.now() > parsed.expiry) {
                localStorage.removeItem(key);
              }
            }
          } catch {
            // 如果解析失败，删除该缓存
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.warn('Failed to cleanup expired cache:', error);
    }
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
  const cachedData = queryClient.getQueryData(queryKey) as ReturnRateBySectorsResponse | undefined;
  
  // 检查持久化缓存
  const persistentCacheKey = `sector-${range}-${endDate}`;
  const shouldUsePersistentCache = usePersistentCache && 
    !forceRefresh && 
    cachePersistence.isCacheValid(persistentCacheKey);
  
  let initialData: ReturnRateBySectorsResponse | undefined;
  let isFromCache = false;
  
  if (shouldUsePersistentCache && !cachedData) {
    const persisted = cachePersistence.getFromStorage<ReturnRateBySectorsResponse>(persistentCacheKey);
    if (persisted) {
      initialData = persisted.data;
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
        console.log(`Cache already exists for range ${range}, skipping preload`);
        return Promise.resolve();
      }
      
      return queryClient.prefetchQuery({
        queryKey,
        queryFn: async () => {
          try {
            const endDate = dateUtils.getToday();
            const startDate = dateUtils.calculateStartDate(range, endDate);
            console.log(`Preloading data for range ${range} (${startDate} to ${endDate})`);
            // 修正：使用计算出的日期而不是硬编码的日期
            const data = await etfService.getAllSectorsReturnRate("2024-07-04", "2024-07-05", false);
            console.log(`Successfully preloaded data for range ${range}, data available:`, !!data && !!data.sector_results && data.sector_results.length > 0);
            return data;
          } catch (error) {
            console.error(`Error preloading data for range ${range}:`, error);
            throw error; // 重新抛出错误以便Promise.allSettled能够捕获
          }
        },
        staleTime: 12 * 60 * 60 * 1000,
        gcTime: 24 * 60 * 60 * 1000,
      });
    });
    
    const results = await Promise.allSettled(promises);
    
    // 记录预加载结果
    results.forEach((result, index) => {
      const range = timeRangeValues[index];
      if (result.status === 'fulfilled') {
        const cachedData = queryClient.getQueryData(cacheKeys.sectorReturnRate(range));
        console.log(`Preload for range ${range} completed, data cached:`, !!cachedData);
      } else {
        console.error(`Preload for range ${range} failed:`, result.reason);
      }
    });
    
    // 返回所有成功预加载的数据
    const preloadedData = timeRangeValues.reduce((acc, range) => {
      const data = queryClient.getQueryData(cacheKeys.sectorReturnRate(range)) as ReturnRateBySectorsResponse | undefined;
      if (data) {
        acc[range] = data;
      }
      return acc;
    }, {} as Record<TimeRange, ReturnRateBySectorsResponse>);
    
    return preloadedData;
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
    cachePersistence.cleanupExpired();
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