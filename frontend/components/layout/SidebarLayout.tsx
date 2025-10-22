
import { AppSidebar } from "@/components/layout/app-sidebar"
import HeaderLayout from "@/components/layout/HeaderLayout"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"


interface SidebarProps {
  breadcrumbItems: {
    label: string,
    href?: string;
    isHiddenOnMobile?: boolean;
  }[];
  children: React.ReactNode
}

const SidebarLayout: React.FC<SidebarProps> = ({ breadcrumbItems, children }) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset> 
        <HeaderLayout breadcrumbItems={breadcrumbItems} />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}

export default SidebarLayout