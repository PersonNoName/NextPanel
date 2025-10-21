import { QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// 创建一个新的QueryClient实例
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // 请求失败时重试1次
      refetchOnWindowFocus: false, // 窗口重新聚焦时不重新获取数据
      staleTime: 5 * 60 * 1000, // 数据5分钟内视为新鲜
      gcTime: 10 * 60 * 1000, // 未使用的数据10分钟后被垃圾回收
    },
    mutations: {
      onError: (error: any) => {
        // 这里可以添加全局的变更错误处理
        // 注意：详细的错误处理已经在apiclient的拦截器中完成
        console.error('Mutation error:', error);
      },
      onSuccess: (data: any) => {
        // 对于成功的变更操作，如果服务器返回了成功消息，可以显示它
        if (data && data.message) {
          toast.success(data.message);
        }
      },
    },
  },
});

export default queryClient;