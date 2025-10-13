'use client';

import { useEffect, useRef, useCallback } from 'react';
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
  data?: {
    profit: number[];
    income: number[];
    expenses: number[];
  };
  style?: string;
}

export default function NegativeBarChartComponent({ data, style }: BarChartProps) {
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
      
      // 销毁并重新初始化，确保完全重绘
      if (chartRef.current) {
        chartInstance.current.dispose();
        chartInstance.current = echarts.init(chartRef.current, 'dark');
        
        const option: EChartsOption = {
          darkMode: true,
          backgroundColor: '#000000',
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow',
            },
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '10%',
            containLabel: true,
          },
          xAxis: {
            type: 'value',
            name: '涨跌幅(%)',
            nameLocation: 'middle',
            nameGap: 30,
            nameTextStyle: {
              fontSize: 12,
              color: '#fff'
            }
          },
          yAxis: {
            type: 'category',
            axisTick: {
              show: false,
            },
            data: [
              '煤炭',
              '中药',
              '电力',
              '银行',
              '红利',
              '一带一路',
              '房地产',
              '石油石化',
              '食品饮料',
              '证券',
              '白酒',
              '中证200',
            ],
          },
          series: [
            {
              name: '涨跌幅',
              type: 'bar',
              barWidth: '60%',
              data: [
                1.8, 0.9, 0.6, 0.45, 0.43, 0.42, 0.38, 0.35, 0.25, 0.02, -0.1, -0.5,
              ],
              itemStyle: {
                color: function (params) {
                  const colorList = [
                    '#5470c6',
                    '#61a0a8',
                    '#7ecf9f',
                    '#d4ec59',
                    '#ffdb5c',
                    '#ff9966',
                    '#ff6666',
                  ];
                  return colorList[params.dataIndex % colorList.length];
                },
              },
            }
          ],
        };
        
        chartInstance.current.setOption(option);
      }
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
    chartInstance.current = echarts.init(chartRef.current, 'dark');

    const option: EChartsOption = {
      darkMode: true,
      backgroundColor: '#000000',
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        name: '涨跌幅(%)',
        nameLocation: 'middle',
        nameGap: 30,
        nameTextStyle: {
          fontSize: 12,
          color: '#fff'
        }
      },
      yAxis: {
        type: 'category',
        axisTick: {
          show: false,
        },
        data: [
          '煤炭',
          '中药',
          '电力',
          '银行',
          '红利',
          '一带一路',
          '房地产',
          '石油石化',
          '食品饮料',
          '证券',
          '白酒',
          '中证200',
        ],
      },
      series: [
        {
          name: '涨跌幅',
          type: 'bar',
          barWidth: '60%',
          data: [
            1.8, 0.9, 0.6, 0.45, 0.43, 0.42, 0.38, 0.35, 0.25, 0.02, -0.1, -0.5,
          ],
          itemStyle: {
            color: function (params) {
              const colorList = [
                '#5470c6',
                '#61a0a8',
                '#7ecf9f',
                '#d4ec59',
                '#ffdb5c',
                '#ff9966',
                '#ff6666',
              ];
              return colorList[params.dataIndex % colorList.length];
            },
          },
        }
      ],
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
      className={cn("w-full h-full", style)}
      style={{ 
        position: 'relative',
        minHeight: '400px'
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
          height: '100%'
        }}
      />
    </div>
  );
}