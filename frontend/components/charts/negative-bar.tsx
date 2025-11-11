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
  const [isMounted, setIsMounted] = useState(false);
  
  // 🔑 关键优化：使用 ref 存储上一次的数据哈希，避免不必要的重绘
  const lastDataHashRef = useRef<string>('');
  const isInitializedRef = useRef<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 🔑 关键优化：生成数据哈希来判断数据是否真的变化了
  const dataHash = useMemo(() => {
    return JSON.stringify({
      data,
      category_field,
      value_field,
      customColorList
    });
  }, [data, category_field, value_field, customColorList]);

  // 处理数据格式
  const { categories, processedData } = useMemo(() => {
    const cats = data.map(item => String(item[category_field]));
    const processed = data.map(item => {
      let value = item[value_field];
      if (typeof value === 'string') {
        value = parseFloat(value);
      }
      return isNaN(value) ? 0 : value;
    });
    
    return { categories: cats, processedData: processed };
  }, [data, category_field, value_field]);

  // 缓存颜色列表
  const colorList = useMemo(() => {
    const colorSource = customColorList.length > 0 ? customColorList : BASE_COLOR_LIST;
    return Array.from({ length: categories.length }, (_, i) => 
      colorSource[i % colorSource.length]
    );
  }, [categories.length, customColorList]);

  // 生成图表配置项
  const getChartOption = useCallback((): EChartsOption => {
    const dataMin = Math.min(...processedData);
    const dataMax = Math.max(...processedData);
    const padding = Math.max(Math.abs(dataMin), Math.abs(dataMax)) * 0.1;
    
    return {
      darkMode: true,
      backgroundColor: 'transparent',
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
            color: '#fff',
            width: 2
          } 
        },
        axisLabel: { 
          color: '#fff',
          fontSize: 12,
          formatter: (value: number) => Math.round(value).toString(),
        },
        splitLine: {
          lineStyle: {
            color: '#444',
            type: 'dashed'
          }
        },
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
            color: '#fff',
            width: 2
          } 
        },
        axisLabel: { 
          color: '#fff',
          fontSize: 12,
          interval: 0
        },
        inverse: false
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
              position: value < 0 ? 'left' : 'right',
              color: '#fff',
              fontSize: 12,
              fontWeight: 'bold'
            }
          })),
          barMinHeight: 1,
          animation: true,
          animationDuration: 1000,
          animationEasing: 'elasticOut'
        },
      ],
    };
  }, [categories, processedData, colorList]);

  // 🔑 关键优化：只在数据真正变化时更新图表
  const updateChartOption = useCallback(() => {
    if (!chartInstance.current) return;
    
    try {
      const option = getChartOption();
      // 使用 notMerge: false 来更新而不是完全重绘
      chartInstance.current.setOption(option, { notMerge: false, lazyUpdate: true });
    } catch (error) {
      console.error('Failed to update chart:', error);
    }
  }, [getChartOption]);

  // 初始化图表（只在首次挂载时执行）
  const initChart = useCallback(() => {
    if (!chartRef.current || !containerRef.current || !isMounted) return false;
    
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return false;

    try {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current, 'dark');
        console.log('📊 图表初始化');
      }
      
      const option = getChartOption();
      chartInstance.current.setOption(option, true);
      isInitializedRef.current = true;
      lastDataHashRef.current = dataHash;
      return true;
    } catch (error) {
      console.error('Failed to initialize chart:', error);
      return false;
    }
  }, [getChartOption, isMounted, dataHash]);

  // 调整尺寸
  const resizeChart = useCallback(() => {
    if (!chartInstance.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const newWidth = Math.floor(rect.width);
    const newHeight = Math.floor(rect.height);

    if (newWidth <= 0 || newHeight <= 0) return;

    try {
      chartInstance.current.resize({ width: newWidth, height: newHeight });
    } catch (error) {
      console.error('Failed to resize chart:', error);
    }
  }, []);

  // 防抖resize
  const debouncedResize = useCallback(() => {
    if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
    resizeTimerRef.current = setTimeout(resizeChart, 150);
  }, [resizeChart]);

  // 🔑 关键优化：首次初始化（只执行一次）
  useEffect(() => {
    if (!isMounted || isInitializedRef.current) return;

    const initTimer = setTimeout(() => {
      const success = initChart();
      if (!success) {
        setTimeout(initChart, 100);
      }
    }, 100);

    return () => {
      clearTimeout(initTimer);
    };
  }, [isMounted, initChart]);

  // 🔑 关键优化：数据变化时只更新，不重新初始化
  useEffect(() => {
    // 如果数据哈希没有变化，跳过更新
    if (dataHash === lastDataHashRef.current) {
      return;
    }

    // 如果图表已经初始化，只更新配置
    if (isInitializedRef.current && chartInstance.current) {
      console.log('🔄 数据更新，刷新图表配置');
      lastDataHashRef.current = dataHash;
      updateChartOption();
    }
  }, [dataHash, updateChartOption]);

  // 监听尺寸变化
  useEffect(() => {
    if (!isMounted || !containerRef.current) return;

    const resizeObserver = new ResizeObserver(debouncedResize);
    resizeObserver.observe(containerRef.current);
    
    window.addEventListener('resize', debouncedResize);

    return () => {
      window.removeEventListener('resize', debouncedResize);
      resizeObserver.disconnect();
      
      if (resizeTimerRef.current) {
        clearTimeout(resizeTimerRef.current);
        resizeTimerRef.current = null;
      }
    };
  }, [debouncedResize, isMounted]);

  // 组件卸载时完全清理
  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        console.log('🗑️ 图表销毁');
        chartInstance.current.dispose();
        chartInstance.current = null;
        isInitializedRef.current = false;
      }
    };
  }, []);

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
        backgroundColor: '#000000'
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