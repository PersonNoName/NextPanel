"use client";
import { useState, ReactNode, useMemo } from "react";
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
  id: string;
  label: string;
  value: string;
}

// 组件 props
interface MultiSelectPopoverProps {
  options: Option[];
  buttonText?: string;
  customButton?: ReactNode;
  onOpenChange?: (open: boolean) => void;
  onSelectionChange?: (selectedValues: string[]) => void;
  maxLabelWidth?: number | string;
  popoverWidth?: number | string;
}

function getFirstLetter(str: string): string {
  if (!str) return "#";
  const py = pinyin(str.charAt(0), { pattern: 'first', toneType: 'none' });
  return py.toUpperCase() || "#";
}
export function MultiSelectPopover({ 
  options, 
  buttonText = "选择选项", 
  customButton, 
  onOpenChange,
  maxLabelWidth = "120px",
  popoverWidth = "auto"
}: MultiSelectPopoverProps) {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  // 按拼音首字母分组
  const groupedOptions = useMemo(() => {
    const groups: { [key: string]: Option[] } = {};
    
    options.forEach(option => {
      const firstLetter = getFirstLetter(option.label);
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(option);
    });
    
    // 按字母排序
    const sortedGroups = Object.keys(groups).sort().reduce((acc, key) => {
      acc[key] = groups[key];
      return acc;
    }, {} as { [key: string]: Option[] });
    
    return sortedGroups;
  }, [options]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  const sendSelectionToBackend = async (value: string) => {
    console.log("发送数据到后端:", value);
  };

  const handleOptionChange = async (optionValue: string, checked: boolean) => {
    let newSelectedValues: string[];
    if (checked) {
      newSelectedValues = [...selectedValues, optionValue];
    } else {
      newSelectedValues = selectedValues.filter(value => value !== optionValue);
    }
    setSelectedValues(newSelectedValues);
    await sendSelectionToBackend(optionValue);
  };

  const triggerButton = customButton || (
    <Button variant="outline">
      {buttonText}
      {selectedValues.length > 0 && (
        <span className="ml-2 text-xs bg-primary/10 px-1.5 py-0.5 rounded-full">
          {selectedValues.length}
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
          {Object.entries(groupedOptions).map(([letter, groupOptions]) => (
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
                  <div key={option.id} className="flex items-center space-x-2 group w-full">
                    <Checkbox
                      id={option.id}
                      checked={selectedValues.includes(option.value)}
                      onCheckedChange={(checked) => 
                        handleOptionChange(option.value, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={option.id}
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
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// 使用示例
export default function Demo() {
  const sampleOptions = [
    { id: "1", label: "苹果", value: "apple" },
    { id: "2", label: "香蕉", value: "banana" },
    { id: "3", label: "橙子", value: "orange" },
    { id: "4", label: "葡萄", value: "grape" },
    { id: "5", label: "西瓜", value: "watermelon" },
    { id: "6", label: "草莓", value: "strawberry" },
    { id: "7", label: "芒果", value: "mango" },
    { id: "8", label: "樱桃", value: "cherry" },
    { id: "9", label: "柠檬", value: "lemon" },
    { id: "10", label: "桃子", value: "peach" },
  ];

  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <MultiSelectPopover 
        options={sampleOptions}
        buttonText="选择水果"
        popoverWidth="280px"
      />
    </div>
  );
}