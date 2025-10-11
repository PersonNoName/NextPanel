import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import NegativeBarChartComponent from "@/components/charts/negative-bar"

interface DataTableStyles {
  table?: string;
  header?: string;
  body?: string;
  row?: string;
  cell?: string;
  caption?: string;
}

interface DataTableProps {
  data: Record<string, any>[],
  columns: Record<string, string>,
  showHeader?: boolean;
  className?: string;
  styles?: DataTableStyles;
  // 新增：允许为特定列指定格式化函数
  columnFormatters?: Record<string, (value: any, row: Record<string, any>) => React.ReactNode>;
}

export function DataTable({
  data = [],
  columns = {},
  showHeader = true,
  className = "",
  styles = {},
  columnFormatters = {}
}: Partial<DataTableProps>) { 
  return ( 
    <Table className={cn(styles.table, className)}>
      {showHeader && (
        <TableHeader className={styles.header}>
          <TableRow className={styles.row}>
            {Object.keys(columns).map((col) => (
              <TableHead 
                key={col} 
                className={styles.cell}
              >
                {columns[col]}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
      )}
      
      <TableBody className={styles.body}>
        {data.map((row, index) => (
          <TableRow 
            key={index} 
            className={styles.row}
          >
            {Object.keys(columns).map((col) => {
              // 检查是否有自定义格式化函数
              const formatter = columnFormatters[col];
              const cellContent = formatter ? formatter(row[col], row) : row[col];
              
              return (
                <TableCell 
                  key={col} 
                  className={styles.cell}
                >
                  {cellContent}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}