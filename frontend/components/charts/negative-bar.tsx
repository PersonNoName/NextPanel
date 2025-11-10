'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as echarts from 'echarts/core';
import {
  TooltipComponent,
  TooltipComponentOption,
  GridComponent,
  GridComponentOption,
  LegendComponent,
  LegendComponentOption,
} from 'echarts/components';
import { BarChart, BarSeriesOption } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { cn } from '@/lib/utils';

echarts.use([
  TooltipComponent,
  GridComponent,
  LegendComponent,
  BarChart,
  CanvasRenderer,
]);

type EChartsOption = echarts.ComposeOption<
  | TooltipComponentOption
  | GridComponentOption
  | LegendComponentOption
  | BarSeriesOption
>;

interface BarChartProps {
  data: Record<string, any>[];
  style?: string;
  category_field?: string;
  value_field?: string;
  customColorList?: string[];
}

// 内置基础颜色列表 - 使用更鲜明的颜色
const BASE_COLOR_LIST = [
  '#5470c6', '#61a0a8', '#7ecf9f', '#d4ec59', '#ffdb5c',
  '#ff9966', '#ff6666', '#9b59b6', '#34495e', '#1abc9c',
  '#e67e22', '#3498db', '#2ecc71', '#f1c40f', '#e74c3c',
];

export default function NegativeBarChartComponent({
  data = [],
  style,
  category_field = 'category',
  value_field = 'value',
  customColorList = [],
}: BarChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const resizeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const destroyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSizeRef = useRef({ width: 0, height: 0 });
  const [isMounted, setIsMounted] = useState(false);

  // 确保组件已经挂载
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 🔴 修复1：处理数据格式，确保值是数字
  const { categories, processedData } = useMemo(() => {
    const cats = data.map(item => String(item[category_field]));
    const processed = data.map(item => {
      let value = item[value_field];
      // 确保值是数字类型
      if (typeof value === 'string') {
        value = parseFloat(value);
      }
      // 如果转换失败，设置为0
      return isNaN(value) ? 0 : value;
    });
    
    return { categories: cats, processedData: processed };
  }, [data, category_field, value_field]);

  // 🔴 修复2：调试日志 - 检查数据
  useEffect(() => {
    console.log('Chart data:', {
      categories,
      processedData,
      originalData: data
    });
  }, [categories, processedData, data]);

  // 🔴 修复3：缓存颜色列表
  const colorList = useMemo(() => {
    const colorSource = customColorList.length > 0 ? customColorList : BASE_COLOR_LIST;
    return Array.from({ length: categories.length }, (_, i) => 
      colorSource[i % colorSource.length]
    );
  }, [categories.length, customColorList]);

  // 🔴 修复4：生成图表配置项 - 修复颜色和数据显示问题
  const getChartOption = useCallback((): EChartsOption => {
    // 计算数据范围，用于设置坐标轴
    const dataMin = Math.min(...processedData);
    const dataMax = Math.max(...processedData);
    const padding = Math.max(Math.abs(dataMin), Math.abs(dataMax)) * 0.1; // 10% 的边距
    
    console.log('Data range:', { dataMin, dataMax, padding });

    return {
      darkMode: true,
      backgroundColor: 'transparent', // 改为透明背景
      tooltip: {
        trigger: 'axis',
        axisPointer: { 
          type: 'shadow',
          shadowStyle: {
            color: 'rgba(150, 150, 150, 0.3)'
          }
        },
        formatter: (params: any) => {
          const param = params[0];
          return `${param.name}<br/>${param.seriesName}: ${param.value}`;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        name: '涨跌幅(%)',
        nameLocation: 'middle',
        nameGap: 30,
        nameTextStyle: { 
          fontSize: 12, 
          color: '#fff',
          fontWeight: 'bold'
        },
        axisLine: { 
          lineStyle: { 
            color: '#fff', // 改为白色更明显
            width: 2
          } 
        },
        axisLabel: { 
          color: '#fff',
          fontSize: 12,
          // 新增：将x轴数值格式化为整数（解决显示过长）
          formatter: (value: number) => Math.round(value).toString(),
        },
        splitLine: {
          lineStyle: {
            color: '#444',
            type: 'dashed'
          }
        },
        // 设置坐标轴范围，确保数据可见
        min: dataMin - padding,
        max: dataMax + padding
      },
      yAxis: {
        type: 'category',
        axisTick: { 
          show: false 
        },
        data: categories,
        axisLine: { 
          lineStyle: { 
            color: '#fff', // 改为白色更明显
            width: 2
          } 
        },
        axisLabel: { 
          color: '#fff',
          fontSize: 12,
          interval: 0 // 显示所有标签
        },
        inverse: false // 确保类别顺序正确
      },
      series: [
        {
          name: '涨跌幅',
          type: 'bar',
          barWidth: '60%',
          data: processedData.map((value, index) => ({
            value,
            itemStyle: {
              color: colorList[index % colorList.length],
              borderWidth: 0,
            },
            label: {
              show: true,
              position: value < 0 ? 'left' : 'right', // 负值左、正值右
              color: '#fff',
              fontSize: 12,
              fontWeight: 'bold'
            }
          })),

          // 确保柱状图有最小高度
          barMinHeight: 1,
          // 添加动画
          animation: true,
          animationDuration: 1000,
          animationEasing: 'elasticOut'
        },
      ],
    };
  }, [categories, processedData, colorList]);

  // 🔴 关键优化：检查容器尺寸是否有效
  const hasValidContainerSize = useCallback(() => {
    if (!containerRef.current) return false;
    
    const rect = containerRef.current.getBoundingClientRect();
    const { width, height } = rect;
    
    return width > 0 && height > 0;
  }, []);

  // 🔴 关键优化：初始化图表
  const initChart = useCallback(() => {
    if (!chartRef.current || !containerRef.current || !isMounted) return;
    
    // 检查容器尺寸
    if (!hasValidContainerSize()) {
      console.warn('Container has invalid size, delaying chart initialization');
      return false;
    }

    try {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current, 'dark');
        
        // 添加调试事件
        chartInstance.current.on('rendered', () => {
          console.log('Chart rendered successfully');
        });
        
        chartInstance.current.on('finished', () => {
          console.log('Chart animation finished');
        });
      }
      
      const option = getChartOption();
      console.log('Setting chart option:', option);
      chartInstance.current.setOption(option, true); // 使用 true 强制刷新
      return true;
    } catch (error) {
      console.error('Failed to initialize chart:', error);
      return false;
    }
  }, [getChartOption, hasValidContainerSize, isMounted]);

  // 🔴 关键优化：调整尺寸
  const resizeChart = useCallback(() => {
    if (!chartInstance.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const newWidth = Math.floor(rect.width);
    const newHeight = Math.floor(rect.height);

    // 检查尺寸是否有效
    if (newWidth <= 0 || newHeight <= 0) return;

    if (lastSizeRef.current.width !== newWidth || lastSizeRef.current.height !== newHeight) {
      lastSizeRef.current = { width: newWidth, height: newHeight };
      
      try {
        chartInstance.current.resize({ width: newWidth, height: newHeight });
        chartInstance.current.setOption(getChartOption());
      } catch (error) {
        console.error('Failed to resize chart:', error);
      }
    }
  }, [getChartOption]);

  // 防抖resize
  const debouncedResize = useCallback(() => {
    if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
    resizeTimerRef.current = setTimeout(resizeChart, 150);
  }, [resizeChart]);

  // 🔴 关键优化：延迟初始化，确保DOM已渲染
  useEffect(() => {
    if (!isMounted) return;

    const initTimer = setTimeout(() => {
      const success = initChart();
      if (!success) {
        // 如果初始化失败，在下一个事件循环中重试
        setTimeout(initChart, 100);
      }
    }, 100);

    return () => {
      clearTimeout(initTimer);
    };
  }, [initChart, isMounted]);

  // 🔴 关键优化：清理函数重构
  const cleanupChart = useCallback(() => {
    if (resizeTimerRef.current) {
      clearTimeout(resizeTimerRef.current);
      resizeTimerRef.current = null;
    }
    
    if (destroyTimerRef.current) {
      clearTimeout(destroyTimerRef.current);
      destroyTimerRef.current = null;
    }

    // 立即清理图表实例
    if (chartInstance.current) {
      chartInstance.current.dispose();
      chartInstance.current = null;
    }
  }, []);

  // 🔴 关键优化：监听尺寸变化
  useEffect(() => {
    if (!isMounted || !containerRef.current) return;

    // 监听尺寸变化
    const resizeObserver = new ResizeObserver(debouncedResize);
    resizeObserver.observe(containerRef.current);
    
    // 监听窗口变化
    window.addEventListener('resize', debouncedResize);

    // 监听DOM布局变化
    const mutationObserver = new MutationObserver(debouncedResize);
    let parentToObserve = containerRef.current.parentElement;
    let depth = 0;
    
    while (parentToObserve && depth < 5) {
      mutationObserver.observe(parentToObserve, {
        attributes: true,
        attributeFilter: ['class', 'style'],
        childList: false,
        subtree: false,
      });
      parentToObserve = parentToObserve.parentElement;
      depth++;
    }

    // 正确的清理函数
    return () => {
      // 清理事件监听器
      window.removeEventListener('resize', debouncedResize);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      
      // 清理定时器
      if (resizeTimerRef.current) {
        clearTimeout(resizeTimerRef.current);
        resizeTimerRef.current = null;
      }
      
      // 延迟清理图表实例（避免频繁创建销毁）
      destroyTimerRef.current = setTimeout(() => {
        cleanupChart();
      }, 100);
    };
  }, [debouncedResize, isMounted, cleanupChart]);

  // 🔴 关键优化：组件卸载时完全清理
  useEffect(() => {
    return () => {
      cleanupChart();
    };
  }, [cleanupChart]);

  // 添加加载状态
  if (!isMounted) {
    return (
      <div
        ref={containerRef}
        className={cn("w-full h-full flex items-center justify-center", style)}
        style={{ minHeight: '400px' }}
      >
        <div className="text-gray-500">图表加载中...</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn("w-full h-full", style)}
      style={{ 
        position: 'relative', 
        minHeight: '400px',
        width: '100%',
        height: '100%',
        backgroundColor: '#000000' // 确保容器有黑色背景
      }}
    >
      <div
        ref={chartRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          minWidth: '1px',
          minHeight: '1px',
        }}
      />
    </div>
  );
}