import NegativeBarChartComponent from "@/components/charts/negative-bar"
import { DataTable } from "@/components/data-table"

export default function OverviewPage() {
  // 涨跌幅格式化函数：根据数值正负添加不同背景色
  const formatChangeRate = (value: string) => {
    // 提取数值部分并转换为数字
    const rate = parseFloat(value);
    // 判断正负并添加相应样式
    const bgColor = rate < 0 ? 'bg-green-100' : 'bg-red-100';
    const textColor = rate < 0 ? 'text-green-800' : 'text-red-800';
    
    return (
      <span className={`px-2 py-1 rounded font-medium ${bgColor} ${textColor}`}>
        {value}
      </span>
    );
  };

  return (
    <div className="flex h-full mx-auto p-4 flex-col gap-4">
      {/* 使用3列网格布局 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 w-full">
        {/* 左侧占1/3，与右侧图表高度保持一致 */}
        <div className="bg-gray-100 p-4 rounded-lg shadow flex flex-col">
          <p className="text-lg font-bold mb-2">各板块涨跌幅</p>
          {/* 表格容器占满剩余空间并可滚动 */}
          <div className="flex-1 overflow-y-auto">
            <DataTable 
              showHeader={false} 
              columns={{ 名称: '名称', 涨跌幅: '涨跌幅' }}
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
                { 名称: '中证200', 涨跌幅: '-0.67%' }
              ]}
              // 指定涨跌幅列的格式化函数
              columnFormatters={{
                涨跌幅: formatChangeRate
              }}
              styles={{
                table: 'w-full',
                cell: 'whitespace-nowrap text-sm py-2'
              }}
            />
          </div>
        </div>
        {/* 右侧占2/3，使用col-span-2跨越2列 */}
        <div className="col-span-2 shadow flex items-center justify-center">
          <NegativeBarChartComponent style={'h-full'} />
        </div>
      </div>
      
      {/* 其他部分保持不变 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 w-full">
        <div className="bg-gray-100 p-4 rounded-lg shadow h-48">
        </div>
        <div className="bg-gray-100 p-4 rounded-lg shadow h-48">

        </div>
        <div className="bg-gray-100 p-4 rounded-lg shadow h-48">

        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 w-full">
        {/* 左侧占1/3 */}
        <div className="bg-gray-100 p-4 rounded-lg shadow flex flex-col">
          <p className="text-lg font-bold mb-2">另一个表格区域</p>
          <div className="flex-1 overflow-y-auto">
            Hello
          </div>
        </div>
        {/* 右侧占2/3，使用col-span-2跨越2列 */}
        <div className="col-span-2 bg-gray-100 p-4 rounded-lg shadow">
          <NegativeBarChartComponent style={'h-full'} />
        </div>
      </div>
    </div>
  )
}