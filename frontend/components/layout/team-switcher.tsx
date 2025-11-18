"use client"

import * as React from "react"
import { ChevronsUpDown, LogOut, CircleUserRound } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

import { useGetCurrentUser, useLogout } from "@/hooks/useUserQueryHooks"

export function TeamSwitcher({
  tools,
}: {
  tools: {
    name: string
    logo: React.ElementType
    onClick: () => void
  }[]
}) {
  const { isMobile } = useSidebar()
  // 使用forceRefresh=false确保优先使用缓存，避免不必要的加载
  const { data: userData, isLoading } = useGetCurrentUser()
  console.log("当前用户数据:", userData);
  const { mutate: logout } = useLogout()
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              {/* 使用isLoading确保在服务端和客户端有一致的渲染行为 */}
              {isLoading ? (
                <>
                  <Skeleton className="aspect-square size-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse transition-all duration-100" />
                  <div className="grid flex-1 text-left text-sm leading-tight gap-1">
                    <Skeleton className="h-5 w-[80px] rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse transition-all duration-100 delay-100" />
                    {/* 长条形骨架：匹配「邮箱」的尺寸和权重 */}
                    <Skeleton className="h-4 w-[120px] rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse transition-all duration-100 delay-200" />
                  </div>
                </>
              ) : (
               <>
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <CircleUserRound className="size-5" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="text-base font-semibold text-gray-900 dark:text-gray-100">{userData?.user?.username || '用户'}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{userData?.user?.email || ''}</span>
                  </div>
                </>
              )}
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              工具
            </DropdownMenuLabel>
            {tools.map((tool, index) => (
              <DropdownMenuItem
                key={tool.name}
                onClick={tool.onClick}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <tool.logo className="size-3.5 shrink-0" />
                </div>
                {tool.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2" onClick={() => logout({})}>
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent" >
                <LogOut className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">登出</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
