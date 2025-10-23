"use client";
import NegativeBarChartComponent from "@/components/charts/negative-bar"
import { DataTable } from "@/components/data-table"
import { useState, useEffect } from "react"
import { GeneralSelect } from "@/components/general-select";
import { CustomDialog } from "@/components/pop-box"
import { CustomSectionTable } from "@/components/tables/custom-section-table"
import { Button } from "@/components/ui/button";
import { CirclePlus,SquarePlus } from "lucide-react";
import { MultiSelectPopover } from "@/components/multi-select-popover";
import LineChartComponent  from "@/components/charts/line-chart";
import { timeRangeValues } from "@/hooks/useEtfQueryHooks";
import { useGetSectorReturnRate, usePreloadSectorReturnRates } from '@/hooks/useEtfQueryHooks';

// 从基础数据派生出TimeRange类型
export type TimeRange = typeof timeRangeValues[number];

// 基于基础数据生成RangeOptions
const RangeOptions = timeRangeValues.map(value => ({
  value: value.toString(), // 转换为字符串，保持与原示例一致
  label: `${value}天`
}));

const CountOptions = [
  { value: "10", label: "10条"},
  { value: "20", label: "20条"},
  { value: "30", label: "30条"},
]

const testOptions =   [
  { id: "option-1", label: "医药", value: "option1" },
  { id: "option-2", label: "煤炭", value: "option2" },
  { id: "option-3", label: "电力", value: "option3" },
  { id: "option-4", label: "银行", value: "option4" },
];
export default function OverviewPage() {
  const [open, setOpen] = useState(false)
  const [timeSelected, setTimeSelected] = useState<TimeRange>(5);
  const [countSelected, setCountSelected] = useState("10")

    // 使用智能缓存 Hook
  const { 
    data, 
    isLoading, 
    error,
    isFromCache 
  } = useGetSectorReturnRate(timeSelected);
  
  // 预加载所有时间范围的数据
  const { preloadAllRanges } = usePreloadSectorReturnRates();

  useEffect(() => {
    // 组件挂载时预加载所有数据
    preloadAllRanges();
  }, []);
  const formatChangeRate = (value: string) => {
    const rate = parseFloat(value);
    const bgColor = rate < 0 ? 'bg-green-200' : 'bg-red-200';
    const textColor = rate < 0 ? 'text-green-800' : 'text-red-800';
    
    return (
      <span className={`px-2 py-1 rounded font-sm ${bgColor} ${textColor}`}>
        {value}
      </span>
    );
  };

  const handleNameClick = (row: any) => {
    setOpen(true);
  };
  
  async function handleConfirm() {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    alert("提交成功！");
  }
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return (
    <div className="w-full h-full p-4 overflow-y-auto overflow-x-hidden grid grid-cols-1 gap-4 auto-rows-min">
      <p>
        {data?.sector_results?.length}
      </p>
      {/* 第一行 - 各板块涨跌幅表格和图表 */}
      <div className="w-full grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 h-[480px]">
        {/* 左侧表格容器 */}
        <div className="bg-gray-50 p-4 rounded-lg shadow w-full xl:w-96 grid grid-rows-[auto_1fr] overflow-hidden min-w-76">
          <div className="flex flex-between mb-2">
            <p className="text-lg font-bold mb-2 flex justify-start mr-2">各板块涨跌幅</p>
            <GeneralSelect
              options={RangeOptions}
              value={timeSelected.toString()}
              onValueChange={(value) => setTimeSelected(Number(value) as TimeRange)}
              placeholder="选择时间范围"
              size="sm"
              width="auto"
              className="ml-auto bg-gray-50"
            />
            <GeneralSelect
              options={CountOptions}
              value={countSelected}
              onValueChange={setCountSelected}
              placeholder="选择条数"
              size="sm"
              width="auto"
              className="bg-gray-50 ml-1"
            />
          </div>
          <div className="overflow-y-auto">
            <DataTable 
              showHeader={false} 
              columns={{ 
                名称: '名称', 
                涨跌幅: '涨跌幅',
              }}
              data={[
                { 名称: '煤炭', 涨跌幅: '+2.34%' },
                { 名称: '中药', 涨跌幅: '+1.24%' },
                { 名称: '电力', 涨跌幅: '+0.98%' },
                { 名称: '银行', 涨跌幅: '+0.76%' },
                { 名称: '保险', 涨跌幅: '+0.64%' },
                { 名称: '证券', 涨跌幅: '+0.54%' },
                { 名称: '房地产', 涨跌幅: '+0.32%' },
                { 名称: '互联网', 涨跌幅: '+0.12%' },
                { 名称: '白酒', 涨跌幅: '-0.23%' },
                { 名称: '食品', 涨跌幅: '-0.12%' },
                { 名称: '石油石化', 涨跌幅: '-0.45%' },
                { 名称: '中证200', 涨跌幅: '-0.67%' },
                { 名称: '证券', 涨跌幅: '+0.54%' },
                { 名称: '房地产', 涨跌幅: '+0.32%' },
                { 名称: '互联网', 涨跌幅: '+0.12%' },
                { 名称: '白酒', 涨跌幅: '-0.23%' },
                { 名称: '食品', 涨跌幅: '-0.12%' },
                { 名称: '石油石化', 涨跌幅: '-0.45%' },
                { 名称: '中证200', 涨跌幅: '-0.67%' }
              ]}
              columnFormatters={{
                涨跌幅: formatChangeRate
              }}
              buttons={{
                名称: [
                  {
                    label: (row) => row.名称,
                    onClick: handleNameClick,
                    variant: 'outline',
                    className: 'px-2 py-1 text-xs shadow-sm'
                  },
                ]
              }}
              styles={{
                table: 'w-full',
                cell: 'whitespace-nowrap text-sm py-1'
              }}
            />
          </div>
        </div>
        
        {/* 右侧图表容器 - 自动填充剩余空间 */}
        <div className="hidden md:block shadow bg-white rounded-lg overflow-hidden">
          <NegativeBarChartComponent />
        </div>
      </div>
      {/* 第二行 */}
      <div className="w-full grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 h-[480px]">
        <div className="bg-white p-4 rounded-lg shadow w-full xl:w-96 grid grid-rows-[auto_1fr] overflow-hidden  min-w-76">
          <div className="flex flex-between mb-2">
            <p className="text-lg font-bold mb-2 flex justify-start mr-2">各板块涨跌幅</p>
            
            <MultiSelectPopover 
              options={testOptions} 
              customButton={
                <Button variant="ghost" size="icon" className="ml-auto">
                  <SquarePlus className="hover:text-primary transition-all duration-200"/>
                </Button>
              } 
            />
          </div>

          <CustomSectionTable className="p-4 rounded-lg shadow w-full xl:w-96 h-full" />
        </div>
        <div className="hidden md:block shadow bg-white rounded-lg overflow-hidden">
          <LineChartComponent />
        </div>
      </div>

      {open && (
        <CustomDialog
          open={open}
          onOpenChange={setOpen}
          title="全屏视图"
          size="fullscreen"
        >
          <div className="h-full">
            {/* 大量内容 */}
          </div>
        </CustomDialog>
      )}
    </div>
  )
}