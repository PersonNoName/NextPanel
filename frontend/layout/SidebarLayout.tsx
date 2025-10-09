
import { AppSidebar } from "@/components/app-sidebar"
import HeaderLayout from "@/layout/HeaderLayout"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Sidebar } from "lucide-react";
import App from "next/app";

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