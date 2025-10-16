'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as echarts from 'echarts/core';
import {
  TitleComponent,
  TitleComponentOption,
  ToolboxComponent,
  ToolboxComponentOption,
  TooltipComponent,
  TooltipComponentOption,
  GridComponent,
  GridComponentOption,
  LegendComponent,
  LegendComponentOption,
} from 'echarts/components';
import { LineChart, LineSeriesOption } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { cn } from '@/lib/utils';

echarts.use([
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  LineChart,
  CanvasRenderer,
]);

type EChartsOption = echarts.ComposeOption<
  | TitleComponentOption
  | ToolboxComponentOption
  | TooltipComponentOption
  | GridComponentOption
  | LegendComponentOption
  | LineSeriesOption
>;

interface LineChartProps {
  data?: any;
  style?: string;
}

export default function LineChartComponent({ data, style }: LineChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const resizeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSizeRef = useRef({ width: 0, height: 0 });

  const resizeChart = useCallback(() => {
    if (!chartInstance.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const newWidth = Math.floor(rect.width);
    const newHeight = Math.floor(rect.height);

    // 只有尺寸真正变化时才resize
    if (lastSizeRef.current.width !== newWidth || lastSizeRef.current.height !== newHeight) {
      lastSizeRef.current = { width: newWidth, height: newHeight };
      chartInstance.current.resize();
    }
  }, []);

  const debouncedResize = useCallback(() => {
    if (resizeTimerRef.current) {
      clearTimeout(resizeTimerRef.current);
    }
    resizeTimerRef.current = setTimeout(() => {
      resizeChart();
    }, 150);
  }, [resizeChart]);

  useEffect(() => {
    if (!chartRef.current || !containerRef.current) return;

    // 初始化图表
    chartInstance.current = echarts.init(chartRef.current);

    const option: EChartsOption = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#ccc',
        borderWidth: 1,
        textStyle: {
          color: '#333',
        },
      },
      // legend: {
      //   data: ['Email', 'Union Ads', 'Video Ads', 'Direct', 'Search Engine'],
      //   textStyle: {
      //     color: '#666',
      //   },
      //   top: 10,
      //   left: 'center',
      // },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      toolbox: {
        feature: {
          saveAsImage: {
            title: '保存为图片',
            pixelRatio: 2,
          },
        },
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        axisLine: {
          lineStyle: {
            color: '#ccc',
          },
        },
        axisLabel: {
          color: '#666',
        },
      },
      yAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: '#ccc',
          },
        },
        axisLabel: {
          color: '#666',
        },
        splitLine: {
          lineStyle: {
            color: '#f0f0f0',
            type: 'dashed',
          },
        },
      },
      series: [
  {
    name: 'Email',
    type: 'line' as const,
    stack: 'Total',
    data: [120, 132, 101, 134, 90, 230, 210],
    smooth: true,
    lineStyle: {
      width: 3,
    },
  },
  {
    name: 'Union Ads',
    type: 'line' as const,
    stack: 'Total',
    data: [220, 182, 191, 234, 290, 330, 310],
    smooth: true,
    lineStyle: {
      width: 3,
    },
  },
  {
    name: 'Video Ads',
    type: 'line' as const,
    stack: 'Total',
    data: [150, 232, 201, 154, 190, 330, 410],
    smooth: true,
    lineStyle: {
      width: 3,
    },
  },
  {
    name: 'Direct',
    type: 'line' as const,
    stack: 'Total',
    data: [320, 332, 301, 334, 390, 330, 320],
    smooth: true,
    lineStyle: {
      width: 3,
    },
  },
  {
    name: 'Search Engine',
    type: 'line' as const,
    stack: 'Total',
    data: [820, 932, 901, 934, 1290, 1330, 1320],
    smooth: true,
    lineStyle: {
      width: 3,
    },
  },
      ].map(series => ({
        ...series,
        symbol: 'none'
      })),
    };

    chartInstance.current.setOption(option);

    // 使用 ResizeObserver 监听容器尺寸变化
    const resizeObserver = new ResizeObserver((entries) => {
      debouncedResize();
    });

    resizeObserver.observe(containerRef.current);

    // 监听 window resize
    window.addEventListener('resize', debouncedResize);

    // 使用 MutationObserver 监听 DOM 变化（侧边栏切换）
    const mutationObserver = new MutationObserver(() => {
      debouncedResize();
    });

    // 监听最近的可能影响布局的父元素
    let parentToObserve = containerRef.current.parentElement;
    let depth = 0;
    while (parentToObserve && depth < 5) {
      mutationObserver.observe(parentToObserve, {
        attributes: true,
        attributeFilter: ['class', 'style'],
        childList: false,
        subtree: false
      });
      parentToObserve = parentToObserve.parentElement;
      depth++;
    }

    return () => {
      if (resizeTimerRef.current) {
        clearTimeout(resizeTimerRef.current);
      }
      window.removeEventListener('resize', debouncedResize);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      chartInstance.current?.dispose();
    };
  }, [data, debouncedResize]);

  return (
    <div 
      ref={containerRef}
      className={cn("w-full h-full bg-white rounded-lg shadow-lg p-4", style)}
      style={{ 
        position: 'relative',
        minHeight: '384px' // h-96 = 384px
      }}
    >
      <div 
        ref={chartRef}
        style={{
          position: 'absolute',
          top: '1rem', // p-4 = 1rem
          left: '1rem',
          right: '1rem',
          bottom: '1rem',
          width: 'calc(100% - 2rem)',
          height: 'calc(100% - 2rem)'
        }}
      />
    </div>
  );
}