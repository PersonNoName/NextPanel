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
import { Button } from "@/components/ui/button"

interface DataTableStyles {
  table?: string;
  header?: string;
  body?: string;
  row?: string;
  cell?: string;
  caption?: string;
}

interface ButtonConfig {
  label: string | ((row: Record<string, any>) => string);
  onClick: (row: Record<string, any>) => void;
  className?: string | ((row: Record<string, any>) => string);
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: boolean | ((row: Record<string, any>) => boolean);
}

interface DataTableProps {
  data: Record<string, any>[],
  columns: Record<string, string>,
  showHeader?: boolean;
  className?: string;
  styles?: DataTableStyles;
  // 新增：允许为特定列指定格式化函数
  columnFormatters?: Record<string, (value: any, row: Record<string, any>) => React.ReactNode>;
  buttons?: {
    [columnName: string]: ButtonConfig | ButtonConfig[];
  }
}

export function DataTable({
  data = [],
  columns = {},
  showHeader = true,
  className = "",
  styles = {},
  columnFormatters = {},
  buttons = {}
}: Partial<DataTableProps>) { 
  
  // 渲染按钮内容
  const renderButtonContent = (buttonConfig: ButtonConfig, row: Record<string, any>) => {
    const label = typeof buttonConfig.label === 'function' 
      ? buttonConfig.label(row) 
      : buttonConfig.label;
    
    const disabled = typeof buttonConfig.disabled === 'function'
      ? buttonConfig.disabled(row)
      : buttonConfig.disabled;
    
    const style = typeof buttonConfig.className === 'function'
      ? buttonConfig.className(row)
      : buttonConfig.className;

    return (
      <Button
        type="button"
        onClick={() => !disabled && buttonConfig.onClick(row)}
        disabled={disabled}
        variant={buttonConfig.variant}
        className={style}
      >
        {label}
      </Button>
    );
  };

  // 渲染单元格内容
  const renderCellContent = (col: string, row: Record<string, any>) => {
    // 首先检查是否有按钮配置
    const buttonConfig = buttons[col];
    
    if (buttonConfig) {
      // 如果是按钮数组，渲染多个按钮
      if (Array.isArray(buttonConfig)) {
        return (
          <div className="flex gap-2">
            {buttonConfig.map((btnConfig, index) => (
              <div key={index}>
                {renderButtonContent(btnConfig, row)}
              </div>
            ))}
          </div>
        );
      }
      // 单个按钮
      return renderButtonContent(buttonConfig, row);
    }
    
    // 其次检查是否有自定义格式化函数
    const formatter = columnFormatters[col];
    if (formatter) {
      return formatter(row[col], row);
    }
    
    // 默认显示数据
    return row[col];
  };
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
            {Object.keys(columns).map((col) => (
              <TableCell 
                key={col} 
                className={styles.cell}
              >
                {renderCellContent(col, row)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}