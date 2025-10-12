"use client";
import NegativeBarChartComponent from "@/components/charts/negative-bar"
import { DataTable } from "@/components/data-table"
import { useState } from "react"
import { Button } from "@/components/ui/button";
import { CustomDialog } from "@/components/pop-box"

export default function OverviewPage() {
  const [open, setOpen] = useState(false)
  const formatChangeRate = (value: string) => {
    const rate = parseFloat(value);
    const bgColor = rate < 0 ? 'bg-green-100' : 'bg-red-100';
    const textColor = rate < 0 ? 'text-green-800' : 'text-red-800';
    
    return (
      <span className={`px-2 py-1 rounded font-medium ${bgColor} ${textColor}`}>
        {value}
      </span>
    );
  };

  const handleNameClick = (row: any) => {
    setOpen(true);
  };
  async function handleConfirm() {
  await new Promise((resolve) => setTimeout(resolve, 2000)); // 模拟请求
  alert("提交成功！");
}

  return (
    <div className="flex h-full mx-auto p-4 flex-col gap-4">
      {/* 关键修改：使用 grid-rows-1 和 items-stretch */}
      <div className="flex flex-col lg:flex-row w-full h-[480px] gap-4">
        {/* 左侧表格容器 */}
        <div className="bg-gray-100 p-4 rounded-lg shadow flex flex-col w-full lg:w-80 xl:w-96">
          <p className="text-lg font-bold mb-2">各板块涨跌幅</p>
          <div className="flex-1 overflow-y-auto">
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
                    className: 'px-2 py-1 text-xs'
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
        
        <div className="flex-1 shadow min-w-0 bg-white rounded-lg overflow-hidden">
          <NegativeBarChartComponent style={'h-full w-full min-w-0'} />
        </div>
      </div>
      {open && (
        <>
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
        </>
      )}
    </div>
  )
}