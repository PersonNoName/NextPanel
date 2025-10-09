
"use client"
import SidebarLayout from "@/layout/SidebarLayout"
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // 1. 定义当前页面的面包屑数据（动态路由核心：修改这里即可改变面包屑）
  const breadcrumbItems = [
    {
      label: 'Building Your Application',
      href: '#', // 首页/父级路由
      isHiddenOnMobile: true, // 移动端隐藏（与原代码一致）
    },
    {
      label: 'Data Fetching', // 当前页（无链接）
      isHiddenOnMobile: false,
    },
    // 若需要多级路由，直接添加数组项即可，例如：
    // { label: 'API Requests', href: '#api-requests' },
    // { label: 'GET Method', isHiddenOnMobile: false },
  ];
  const pathname = usePathname();
  
  // 解析路径生成面包屑
  const generateBreadcrumbs = () => {
    const items: {label: string; href?: string; isHiddenOnMobile?: boolean}[] = [];
    
    // 分割路径
    const segments = pathname.split('/').filter(segment => segment);
    
    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      // 最后一个 segment 作为当前页，不添加链接
      if (index === segments.length - 1) {
        items.push({ 
          label: segment.charAt(0).toUpperCase() + segment.slice(1),
          isHiddenOnMobile: false
        });
      } else {
        items.push({ 
          label: segment.charAt(0).toUpperCase() + segment.slice(1),
          href: currentPath,
          isHiddenOnMobile: true
        });
      }
    });
    
    return items;
  };
  return (
    // 2. 使用 Sidebar 组件，传入面包屑数据和页面内容
    <SidebarLayout breadcrumbItems={generateBreadcrumbs()}>
      {children}
    </SidebarLayout>
  );
}