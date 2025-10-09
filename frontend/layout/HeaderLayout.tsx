import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { SidebarTrigger } from "@/components/ui/sidebar"
import React from "react"

interface BreadcrumbItemType {
  label: string;
  href?: string;
  isHiddenOnMobile?: boolean;
}
interface HeaderProps {
  breadcrumbItems: BreadcrumbItemType[];
}

const HeaderLayout: React.FC<HeaderProps> = ({ breadcrumbItems }) => {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 !h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbItems.map((item, index) => {
            const isLastItem = index === breadcrumbItems.length - 1;

            return (
              <React.Fragment key={index}>
                {/* 在第一个元素之后添加分隔符 */}
                {index > 0 && (
                  <BreadcrumbSeparator className="hidden md:block" />
                )}
                
                <BreadcrumbItem className={item.isHiddenOnMobile ? "hidden md:block" : ""}>
                  {isLastItem ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={item.href}>
                      {item.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            );
          })}
          {/* <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="#">
              Building Your Application
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>Data Fetching</BreadcrumbPage>
          </BreadcrumbItem> */}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  )
}

export default HeaderLayout