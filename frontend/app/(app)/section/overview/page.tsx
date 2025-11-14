//page.tsx
"use client";
import NegativeBarChartComponent from "@/components/charts/negative-bar"
import { DataTable } from "@/components/data-table"
import { useState, useEffect, useMemo } from "react"
import { GeneralSelect } from "@/components/general-select";
import { CustomDialog } from "@/components/pop-box"
import { CustomSectionTable } from "@/components/tables/custom-section-table"
import { Button } from "@/components/ui/button";
import { CirclePlus,SquarePlus } from "lucide-react";
import { MultiSelectPopover } from "@/components/multi-select-popover";
import LineChartComponent  from "@/components/charts/line-chart";
import { timeRangeValues } from "@/hooks/useEtfQueryHooks";
import {usePreloadSectorReturnRates, useSectorReturnRate}  from "@/hooks/useEtfQueryHooks"
import {getAvailableSectors} from "@/hooks/useEtfQueryHooks"
import { getEtfCollect, addEtfCollect, deleteEtfCollect } from "@/hooks/useEtfQueryHooks";

// 从基础数据派生出TimeRange类型
export type TimeRange = typeof timeRangeValues[number];

// 基于基础数据生成RangeOptions
const RangeOptions = timeRangeValues.map(value => ({
  value: value.toString(),
  label: `${value}天`
}));

const CountOptions = [
  { value: "10", label: "10条"},
  { value: "20", label: "20条"},
  { value: "30", label: "30条"},
]

interface SectorItem {
  cid: string;
  sector: string;
  description: string | null;
  sort_order: number;
  etf_count: number;
}

// 定义目标格式的类型
type OptionType = {
  cid: string;
  label: string;
  value: string;
};

export default function OverviewPage() {
  const [open, setOpen] = useState(false)
  const [timeSelected, setTimeSelected] = useState<TimeRange>(5);
  const [countSelected, setCountSelected] = useState("10")
  const { preload } = usePreloadSectorReturnRates()
  const [availableSectorOptions, setAvailableSectorOptions] = useState<OptionType[]>([]);
  const [availableSectors, setAvailableSectors] = useState<SectorItem[]>([]);
  const [selectedSectors, setSelectedSectors] = useState<SectorItem[]>([]);

  // 将 selectedSectors 转换为 MultiSelectPopover 需要的格式
  const selectedSectorOptions = useMemo(() => {
    return selectedSectors.map(sector => ({
      cid: sector.cid,
      label: sector.sector,
      value: sector.sector
    }));
  }, [selectedSectors]);

  useEffect(() => {
    preload()
    const getConvertedOptions = async () => {
      const CACHE_KEY = 'sectorsDataCache';
      const CACHE_EXPIRE = 7 * 24 * 60 * 60 * 1000;

      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_EXPIRE) {
          const convertedOptions = data.map((item: SectorItem) => ({
            cid: item.cid,
            label: item.sector,
            value: item.sector
          }));
          setAvailableSectors(data);
          setAvailableSectorOptions(convertedOptions);
          return;
        }
      }

      try {
        const sectorsData = await getAvailableSectors();

        const convertedOptions = sectorsData.sectors.map((item) => ({
          cid: item.cid,
          label: item.sector,
          value: item.sector
        }));

        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            data: sectorsData.sectors,
            timestamp: Date.now()
          })
        );
        setAvailableSectors(sectorsData.sectors);
        setAvailableSectorOptions(convertedOptions);
      } catch (error) {
        console.error('获取板块数据失败', error);
        if (cachedData) {
          const { data } = JSON.parse(cachedData);
          const convertedOptions = (data.sectors as SectorItem[]).map((item) => ({
            cid: item.cid,
            label: item.sector,
            value: item.sector,
          }));
          setAvailableSectors(data);
          setAvailableSectorOptions(convertedOptions);
        }
      }
    };

    const getSelectedSectors = async () => {
      try {
        const data = await getEtfCollect();
        console.log("用户自选板块数据:", data);

        const formattedSectors: SectorItem[] = data.collections.map(collect => ({
          cid: collect.cid.toString(),
          sector: collect.sector,
          description: collect.description,
          sort_order: collect.sort_order,
          etf_count: collect.item_count
        }))

        setSelectedSectors(formattedSectors);
      } catch (error) {
        console.error("获取自选板块失败:", error);
      }
    }

    getConvertedOptions();
    getSelectedSectors();
  }, [])

  const { data, isLoading, error } = useSectorReturnRate(timeSelected)

  const topNResults = useMemo(() => {
    if (isLoading || error || !data?.sector_results) return [];
    
    return [...data.sector_results]
      .sort((a, b) => b.avg_return_rate - a.avg_return_rate)
      .slice(0, parseInt(countSelected, 10));
  }, [data, isLoading, error, countSelected]);
  
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

  const handleSelectionChange = async (optionValue: OptionType, isCollected: boolean) => {
    const cid = optionValue.cid.toString();
    try {
      if (isCollected) {
        // 添加自选
        await addEtfCollect(cid);
        // 从 availableSectors 中找到对应的完整数据
        const sectorToAdd = availableSectors.find(sector => sector.cid.toString() === cid);
        if (sectorToAdd) {
          setSelectedSectors((prev) => [
            ...prev,
            sectorToAdd
          ]);
        }
      } else {
        // 删除自选
        await deleteEtfCollect(cid);
        setSelectedSectors((prev) => 
          prev.filter(sector => sector.cid.toString() !== cid)
        );
      }
    } catch (error) {
      console.error("操作失败:", error);
      alert(isCollected ? "添加自选失败！" : "删除自选失败！");
    }
  };

  return (
    <div className="w-full h-full p-4 overflow-y-auto overflow-x-hidden grid grid-cols-1 gap-4 auto-rows-min">
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
                sector : '名称', 
                avg_return_rate_percent: '涨跌幅',
              }}
              data={topNResults}
              columnFormatters={{
                avg_return_rate_percent: formatChangeRate
              }}
              buttons={{
                sector: [
                  {
                    label: (row) => row.sector,
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
          <NegativeBarChartComponent data={topNResults} category_field="sector" value_field="avg_return_rate_percent" />
        </div>
      </div>
      
      {/* 第二行 */}
      <div className="w-full grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 h-[480px]">
        <div className="bg-white p-4 rounded-lg shadow w-full xl:w-96 grid grid-rows-[auto_1fr] overflow-hidden min-w-76">
          <div className="flex flex-between mb-2">
            <p className="text-lg font-bold mb-2 flex justify-start mr-2">自选板块</p>
            
            <MultiSelectPopover 
              options={availableSectorOptions} 
              selectedValues={selectedSectorOptions} // 传递当前选中的板块
              customButton={
                <Button variant="ghost" size="icon" className="ml-auto">
                  <SquarePlus className="hover:text-primary transition-all duration-200"/>
                </Button>
              } 
              onSelectionChange={handleSelectionChange}
            />
          </div>

          <CustomSectionTable 
            className="p-4 rounded-lg shadow w-full xl:w-96 h-full" 
            columns={{ 
              sector : '名称', 
              etf_count: '数量',
            }}
            data={selectedSectors}
          />
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