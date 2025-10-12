"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button" // 假设您有 Button 组件
import { cn } from "@/lib/utils"

interface CustomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  children: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl" | "fullscreen"
  showConfirmButton?: boolean
  showCancelButton?: boolean
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
  className?: string
  showCloseButton?: boolean
}

export function CustomDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = "md",
  showConfirmButton = false,
  showCancelButton = false,
  confirmText = "确定",
  cancelText = "取消",
  onConfirm,
  onCancel,
  className,
  showCloseButton = true,
}: CustomDialogProps) {
  // 处理确认按钮点击
  const handleConfirm = () => {
    onConfirm?.()
    onOpenChange(false)
  }

  // 处理取消按钮点击
  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  // 尺寸映射
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    fullscreen: "w-[95vw] h-[95vh] max-w-[95vw]",
  }
const fullscreenStyles = size === "fullscreen" ? {
    width: '95vw',
    height: '95vh',
    maxWidth: '95vw'
  } : undefined


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={showCloseButton}
        className={cn(
          sizeClasses[size],
          size === "fullscreen" && "dialog-fullscreen flex flex-col",
          className
        )}
      >
        {/* 标题区域 */}
        {(title || description) && (
          <DialogHeader className={cn(size === "fullscreen" && "flex-shrink-0")}>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}

        {/* 内容区域 */}
        <div
          className={cn(
            "flex-1 overflow-auto",
            size === "fullscreen" && "min-h-0" // 全屏时允许内容滚动
          )}
        >
          {children}
        </div>

        {/* 底部按钮区域 */}
        {(showConfirmButton || showCancelButton) && (
          <DialogFooter className={cn("flex-shrink-0", size === "fullscreen" && "mt-4")}>
            {showCancelButton && (
              <Button variant="outline" onClick={handleCancel}>
                {cancelText}
              </Button>
            )}
            {showConfirmButton && (
              <Button onClick={handleConfirm}>
                {confirmText}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}