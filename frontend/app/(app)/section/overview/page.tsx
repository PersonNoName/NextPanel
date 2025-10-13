"use client";
import NegativeBarChartComponent from "@/components/charts/negative-bar"
import { DataTable } from "@/components/data-table"
import { useState } from "react"
import { GeneralSelect } from "@/components/general-select";
import { CustomDialog } from "@/components/pop-box"
import { CustomSectionTable } from "@/components/tables/custom-section-table"
export default function OverviewPage() {
  const [open, setOpen] = useState(false)
  const [timeSelected, setTimeSelected] = useState("1d")
  const [countSelected, setCountSelected] = useState("10")

  const RangeOptions = [
    { value: "1d", label: "1天" },
    { value: "5d", label: "5天" },
    { value: "10d", label: "10天"},
    { value: "15d", label: "15天"},
  ]
  const CountOptions = [
    { value: "10", label: "10条"},
    { value: "20", label: "20条"},
    { value: "30", label: "30条"},
  ]
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

  return (
    <div className="w-full h-full p-4 overflow-y-auto overflow-x-hidden grid grid-cols-1 gap-4 auto-rows-min">
      {/* 第一行 - 表格和图表 */}
      <div className="w-full grid grid-cols-1 xl:grid-cols-[auto_1fr] gap-4 h-[480px]">
        {/* 左侧表格容器 */}
        <div className="bg-gray-50 p-4 rounded-lg shadow w-full xl:w-96 grid grid-rows-[auto_1fr] overflow-hidden">
          <div className="flex flex-between mb-2">
            <p className="text-lg font-bold mb-2 flex justify-start">各板块涨跌幅</p>
            <GeneralSelect
              options={RangeOptions}
              value={timeSelected}
              onValueChange={setTimeSelected}
              placeholder="选择时间范围"
              size="sm"
              width="fit"
              className="ml-auto bg-gray-50"
            />
            <GeneralSelect
              options={CountOptions}
              value={countSelected}
              onValueChange={setCountSelected}
              placeholder="选择条数"
              size="sm"
              width="fit"
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
        <div className="hidden xl:block shadow bg-white rounded-lg overflow-hidden">
          <NegativeBarChartComponent />
        </div>
      </div>
      {/* 第三行 */}
      <div 
        className="w-full"
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: '1rem',
          height: '480px'
        }}
      >
        <div 
          className="bg-gray-50 p-4 rounded-lg shadow"
          style={{ width: '384px' }}
        >
          <CustomSectionTable />
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