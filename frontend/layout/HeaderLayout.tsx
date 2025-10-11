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
import { House } from "lucide-react"
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
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 position: fixed z-index:100 top:0 left:0 right:0 w-full bg-white">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 !h-4" />
      <a href="/dashboard" className="mr-2"><House size={16}/></a>
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
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  )
}

export default HeaderLayout