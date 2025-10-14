"use client";

import { useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils"; // 如果您有 cn utility

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
  maxLabelWidth?: number | string;
  popoverWidth?: number | string;
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
        className="p-4 max-h-96" 
        align="start"
        style={{ width: popoverWidth }}
      >
        <div className="space-y-3">
          <div className="space-y-2">
            {options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2 group w-full">
                <Checkbox
                  id={option.id}
                  checked={selectedValues.includes(option.value)}
                  onCheckedChange={(checked) => 
                    handleOptionChange(option.value, checked as boolean)
                  }
                />
                {/* 修复：确保Label能够正确显示省略号 */}
                <Label
                  htmlFor={option.id}
                  className={cn(
                    "text-sm font-normal cursor-pointer",
                    "transition-colors group-hover:text-primary",
                    // 关键修复：确保文本溢出样式正确应用
                    "block truncate flex-1 min-w-0" // 添加 block, truncate, flex-1 和 min-w-0
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
      </PopoverContent>
    </Popover>
  );
}