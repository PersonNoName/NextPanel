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
import { on } from "events";

// 选项类型定义
interface Option {
  cid: string;
  label: string;
  value: string;
}

// 组件 props
interface MultiSelectPopoverProps {
  options: Option[];
  buttonText?: string;
  customButton?: ReactNode;
  onOpenChange?: (open: boolean) => void;
  onSelectionChange?: (optionValue: string, isCollected: boolean) => void;
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
  onSelectionChange,
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
    onSelectionChange?.(optionValue, checked);
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
                  <div key={option.cid} className="flex items-center space-x-2 group w-full">
                    <Checkbox
                      id={option.cid}
                      checked={selectedValues.includes(option.value)}
                      onCheckedChange={(checked) => 
                        handleOptionChange(option.cid, checked as boolean)
                      }
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
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}