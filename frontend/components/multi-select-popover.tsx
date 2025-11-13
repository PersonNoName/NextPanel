"use client";
import { useState, ReactNode, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { pinyin } from 'pinyin-pro';

// 选项类型定义
interface Option {
  cid: string;
  label: string;
  value: string;
}

// 组件 props
interface MultiSelectPopoverProps {
  options: Option[]; // 全部可用选项（父组件传入）
  buttonText?: string;
  customButton?: ReactNode;
  onOpenChange?: (open: boolean) => void;
  onSelectionChange?: (selectedOption: Option, isCollected: boolean) => void;
  maxLabelWidth?: number | string;
  popoverWidth?: number | string;
  defaultSelectedValues?: Option[]; // 非受控模式：初始已选值（改为Option[]）
  selectedValues?: Option[]; // 受控模式：当前已选值（改为Option[]）
  disabled?: boolean; // 可选：禁用组件
}

// 获取字符串首字母（拼音）
function getFirstLetter(str: string): string {
  if (!str) return "#";
  const py = pinyin(str.charAt(0), { pattern: 'first', toneType: 'none' });
  return py.toUpperCase() || "#";
}

export function MultiSelectPopover({ 
  options = [], // 接收父组件传入的全部可用选项
  buttonText = "选择选项", 
  customButton, 
  onOpenChange,
  onSelectionChange,
  maxLabelWidth = "120px",
  popoverWidth = "auto",
  defaultSelectedValues = [], // 非受控模式初始值（Option[]）
  selectedValues: propsSelectedValues, // 受控模式已选值（Option[]）
  disabled = false
}: MultiSelectPopoverProps) {
  // 状态管理：支持受控/非受控模式（内部状态改为存储Option[]）
  const [internalSelectedValues, setInternalSelectedValues] = useState<Option[]>(() => {
    // 优先使用受控模式的传入值，否则使用非受控初始值
    if (propsSelectedValues) return propsSelectedValues;
    return defaultSelectedValues;
  });

  const [open, setOpen] = useState(false);

  // 当前实际使用的已选值（受控优先，类型为Option[]）
  const currentSelectedValues = propsSelectedValues ?? internalSelectedValues;

  // 当父组件传入的selectedValues变化时，同步内部状态（受控模式）
  useEffect(() => {
    if (propsSelectedValues) {
      setInternalSelectedValues(propsSelectedValues);
    }
  }, [propsSelectedValues]);

  // 按拼音首字母分组（依赖全部选项，不受选中值类型影响）
  const groupedOptions = useMemo(() => {
    const groups: { [key: string]: Option[] } = {};
    
    options.forEach(option => {
      const firstLetter = getFirstLetter(option.label);
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(option);
    });
    
    // 按字母排序（# 排在最后）
    const sortedGroups = Object.keys(groups).sort((a, b) => {
      if (a === "#") return 1;
      if (b === "#") return -1;
      return a.localeCompare(b);
    }).reduce((acc, key) => {
      acc[key] = groups[key];
      return acc;
    }, {} as { [key: string]: Option[] });
    
    return sortedGroups;
  }, [options]);

  // 处理弹窗打开/关闭
  const handleOpenChange = (newOpen: boolean) => {
    if (disabled) return;
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  // 处理选项选择变化（适配Option[]类型的选中值）
  const handleOptionChange = (option: Option, checked: boolean) => {
    if (disabled) return;

    let newSelectedValues: Option[];
    if (checked) {
      // 选中：添加到已选列表（通过value去重，避免重复选中）
      newSelectedValues = currentSelectedValues.some(item => item.value === option.value)
        ? currentSelectedValues
        : [...currentSelectedValues, option];
    } else {
      // 取消选中：从已选列表移除（通过value匹配）
      newSelectedValues = currentSelectedValues.filter(item => item.value !== option.value);
    }

    // 更新状态（非受控模式）
    if (!propsSelectedValues) {
      setInternalSelectedValues(newSelectedValues);
    }

    // 通知父组件选中状态变化
    onSelectionChange?.(option, checked);
  };

  // 获取已选选项的标签文本（用于按钮显示，直接从Option[]中取label）
  const getSelectedLabels = useMemo(() => {
    if (currentSelectedValues.length === 0) return "";
    return currentSelectedValues.map(option => option.label).join("、");
  }, [currentSelectedValues]);

  // 触发按钮（支持自定义按钮或默认按钮）
  const triggerButton = customButton || (
    <Button 
      variant="outline" 
      disabled={disabled}
      className={cn("w-full justify-between", {
        "truncate": currentSelectedValues.length > 0
      })}
    >
      {currentSelectedValues.length > 0 ? getSelectedLabels : buttonText}
      {currentSelectedValues.length > 0 && (
        <span className="ml-2 text-xs bg-primary/10 px-1.5 py-0.5 rounded-full">
          {currentSelectedValues.length}
        </span>
      )}
    </Button>
  );

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        {triggerButton}
      </PopoverTrigger>
      <PopoverContent 
        className="p-4 max-h-96 overflow-y-auto" 
        align="start"
        style={{ width: popoverWidth }}
      >
        <div className="space-y-4">
          {/* 空状态处理 */}
          {Object.keys(groupedOptions).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              暂无选项
            </div>
          ) : (
            Object.entries(groupedOptions).map(([letter, groupOptions]) => (
              <div key={letter} className="space-y-2">
                {/* 字母分组标题 */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    {letter}
                  </div>
                  <div className="flex-1 h-px bg-border"></div>
                </div>
                
                {/* 该分组下的选项 */}
                <div className="space-y-2 pl-2">
                  {groupOptions.map((option) => (
                    <div key={option.cid} className="flex items-center space-x-2 group w-full">
                      <Checkbox
                        id={option.cid}
                        // 检查选项是否已选中（通过value匹配Option[]中的项）
                        checked={currentSelectedValues.some(item => item.value === option.value)}
                        onCheckedChange={(checked) => 
                          handleOptionChange(option, checked as boolean)
                        }
                        disabled={disabled}
                      />
                      <Label
                        htmlFor={option.cid}
                        className={cn(
                          "text-sm font-normal cursor-pointer",
                          "transition-colors group-hover:text-primary",
                          "block truncate flex-1 min-w-0"
                        )}
                        style={{ 
                          maxWidth: maxLabelWidth 
                        }}
                        title={option.label}
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
