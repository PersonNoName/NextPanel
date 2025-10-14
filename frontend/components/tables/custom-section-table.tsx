import * as React from "react"
import { DataTable } from "@/components/data-table"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function CustomSectionTable({ className }: { className?: string }) { 
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
    // setOpen(true);
    console.log(row);
  };
  

  return (
    <DataTable 
      showHeader={false} 
      columns={{ 
        名称: '名称', 
        涨跌幅: '涨跌幅',
      }}
      data={[]}
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
        table: 'w-full w-min-[300px]',
        cell: 'whitespace-nowrap text-sm py-1'
      }}
    />    
  )
}