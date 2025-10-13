"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select" // 根据实际路径调整
import { cn } from "@/lib/utils"

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface GeneralSelectProps {
  // 基础属性
  options?: SelectOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  
  // 功能属性
  disabled?: boolean
  required?: boolean
  name?: string
  
  // 样式属性
  className?: string
  size?: "sm" | "default"
  width?: "auto" | "full" | "fit"
  
  // 分组支持
  groupedOptions?: {
    groupLabel: string
    options: SelectOption[]
  }[]
  
  // 标签和错误状态
  label?: string
  error?: boolean
  errorMessage?: string
}

const GeneralSelect = React.forwardRef<HTMLButtonElement, GeneralSelectProps>(
  (
    {
      options,
      value,
      defaultValue,
      onValueChange,
      placeholder = "请选择",
      disabled = false,
      required = false,
      name,
      className,
      size = "default",
      width = "auto",
      groupedOptions,
      label,
      error = false,
      errorMessage,
      ...props
    },
    ref
  ) => {
    // 宽度样式映射
    const widthClass = {
      auto: "w-auto",
      full: "w-full",
      fit: "w-fit",
    }[width]

    // 错误状态样式
    const errorClasses = error
      ? "border-destructive focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40"
      : ""

    const selectContent = (
      <Select
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
        required={required}
        name={name}
        {...props}
      >
        <SelectTrigger
          ref={ref}
          className={cn(
            widthClass,
            errorClasses,
            className
          )}
          size={size}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        
        <SelectContent>
          {groupedOptions ? (
            // 分组选项渲染
            groupedOptions.map((group, index) => (
              <SelectGroup key={index}>
                <SelectLabel>{group.groupLabel}</SelectLabel>
                {group.options.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))
          ) : (
            // 普通选项渲染
            options?.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    )

    // 如果有标签或错误信息，包装在容器中
    if (label || errorMessage) {
      return (
        <div className="flex flex-col gap-2">
          {label && (
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </label>
          )}
          
          {selectContent}
          
          {error && errorMessage && (
            <p className="text-sm text-destructive">{errorMessage}</p>
          )}
        </div>
      )
    }

    return selectContent
  }
)

GeneralSelect.displayName = "GeneralSelect"

export { GeneralSelect }