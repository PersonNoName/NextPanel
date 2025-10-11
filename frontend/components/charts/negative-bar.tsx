'use client';

import { useEffect, useRef } from 'react';
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

// 注册必要的组件
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

export default function NegativeBarChartComponent({ data, style}: BarChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // 初始化图表
    chartInstance.current = echarts.init(chartRef.current, 'dark');

    // 默认数据
    const chartData = {
      profit: [200, 170, 240, 244, 200, 220, 210],
      ...data,
    };

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
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        name: '涨跌幅(%)'
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
          barWidth: '60%', // 条形的宽度
          data: [
            1.8, // 煤炭
            0.9, // 中药
            0.6, // 电力
            0.45, // 银行
            0.43, // 红利
            0.42, // 一带一路
            0.38, // 房地产
            0.35, // 石油石化
            0.25, // 食品饮料
            0.02, // 证券
            -0.1, // 白酒
            -0.5, // 中证200
          ],
           // 自定义每个条形的颜色，可根据需要调整
          itemStyle: {
            color: function (params) {
              // 这里简单通过数据正负或索引来模拟不同颜色渐变，实际可根据需求精细调整
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

    // 响应式处理
    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, [data]);

  return (
    <div 
      ref={chartRef} 
      className={cn("w-full h-24", style)}
    />
  );
}