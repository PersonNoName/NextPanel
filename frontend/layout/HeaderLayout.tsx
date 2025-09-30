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
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbItems.map((item, index) => {
                const isLastItem = index === breadcrumbItems.length - 1;

                return (
                  <React.Fragment key={index}>
                    {!isLastItem ? (
                      <BreadcrumbItem className = {item.isHiddenOnMobile ? "hidden md:block" : ""}>
                        <BreadcrumbLink href={item.href}>
                          {item.label}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                    ): (
                      <BreadcrumbItem className = {item.isHiddenOnMobile ? "hidden md:block" : ""}>
                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                      </BreadcrumbItem>
                    )}
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
        </div>
      </header>
  )
}

export default HeaderLayout