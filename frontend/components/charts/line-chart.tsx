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
import { EtfMultipleSectorsReturnRateHistoryResponse } from '@/lib/api/etfService';

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
  data?: EtfMultipleSectorsReturnRateHistoryResponse;
  className?: string;
}

export default function SectorLineChart({ data, className = '' }: LineChartProps) {
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

    chartInstance.current = echarts.init(chartRef.current);

    if (!data || !data.results || Object.keys(data.results).length === 0) {
      const emptyOption: EChartsOption = {
        title: {
          text: '暂无数据',
          left: 'center',
          top: 'center',
          textStyle: {
            color: '#999',
            fontSize: 16,
          },
        },
      };
      chartInstance.current.setOption(emptyOption);
      return;
    }

    // 处理数据
    const sectors = Object.values(data.results);
    
    // 获取所有日期并按从小到大的顺序排序
    const allDates = sectors.flatMap(sector => 
      sector.return_rate_history.map(item => item.end_date)
    );
    const uniqueDates = Array.from(new Set(allDates)).sort((a, b) => {
      // 假设日期格式是 YYYY-MM-DD
      return new Date(a).getTime() - new Date(b).getTime();
    });
    
    // 为每个sector创建一个series，确保数据按日期顺序排列
    const series = sectors.map(sector => {
      // 创建一个日期到数据的映射
      const dateToDataMap = new Map();
      sector.return_rate_history.forEach(item => {
        dateToDataMap.set(item.end_date, (item.avg_return_rate * 100).toFixed(2));
      });
      
      // 按排序后的日期顺序获取数据
      const sortedData = uniqueDates.map(date => dateToDataMap.get(date) || null);
      
      return {
        name: sector.sector_description,
        type: 'line' as const,
        data: sortedData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          width: 2,
        },
      };
    });

    const option: EChartsOption = {
      title: {
        text: 'Sector 平均收益率趋势',
        left: 'center',
        top: 10,
        textStyle: {
          color: '#333',
          fontSize: 18,
          fontWeight: 'bold',
        },
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#ccc',
        borderWidth: 1,
        textStyle: {
          color: '#333',
        },
        formatter: (params: any) => {
          if (!Array.isArray(params)) return '';
          const date = params[0]?.axisValue || '';
          let content = `<div style="font-weight: bold; margin-bottom: 8px;">${date}</div>`;
          params.forEach((item: any) => {
            content += `
              <div style="margin: 4px 0;">
                ${item.marker} ${item.seriesName}: <strong>${item.value}%</strong>
              </div>
            `;
          });
          return content;
        },
      },
      legend: {
        data: sectors.map(s => s.sector_description),
        textStyle: {
          color: '#666',
        },
        top: 45,
        left: 'center',
        type: 'scroll',
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: sectors.length > 3 ? 100 : 80,
        containLabel: true,
      },
      toolbox: {
        feature: {
          saveAsImage: {
            title: '保存为图片',
            pixelRatio: 2,
          },
        },
        right: 20,
        top: 10,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: uniqueDates, // 使用排序后的日期
        axisLine: {
          lineStyle: {
            color: '#ccc',
          },
        },
        axisLabel: {
          color: '#666',
          rotate: uniqueDates.length > 10 ? 45 : 0,
          fontSize: 11,
        },
      },
      yAxis: {
        type: 'value',
        name: '收益率 (%)',
        nameTextStyle: {
          color: '#666',
          fontSize: 12,
        },
        axisLine: {
          lineStyle: {
            color: '#ccc',
          },
        },
        axisLabel: {
          color: '#666',
          formatter: '{value}%',
        },
        splitLine: {
          lineStyle: {
            color: '#f0f0f0',
            type: 'dashed',
          },
        },
      },
      series: series,
    };

    chartInstance.current.setOption(option);

    const resizeObserver = new ResizeObserver(() => {
      debouncedResize();
    });

    resizeObserver.observe(containerRef.current);
    window.addEventListener('resize', debouncedResize);

    const mutationObserver = new MutationObserver(() => {
      debouncedResize();
    });

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
      className={`w-full h-full bg-white rounded-lg shadow-lg p-4 ${className}`}
      style={{ 
        position: 'relative',
        minHeight: '500px'
      }}
    >
      <div 
        ref={chartRef}
        style={{
          position: 'absolute',
          top: '1rem',
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