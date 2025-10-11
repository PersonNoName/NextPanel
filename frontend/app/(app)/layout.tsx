
"use client"
import SidebarLayout from "@/layout/SidebarLayout"
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  
  // 解析路径生成面包屑
  const generateBreadcrumbs = () => {
    const items: {label: string; href?: string; isHiddenOnMobile?: boolean}[] = [];
    
    // // 分割路径
    const segments = pathname.split('/').filter(segment => segment);
    const lastSegment = segments.at(-1);
    items.push({ 
      label: lastSegment ? lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1) : '',
      isHiddenOnMobile: false
    });  
    // console.log(segments.at(-1))
    // let currentPath = '';
    // segments.forEach((segment, index) => {
    //   currentPath += `/${segment}`;
    //   // 最后一个 segment 作为当前页，不添加链接
    //   if (index === segments.length - 1) {
    //     items.push({ 
    //       label: segment.charAt(0).toUpperCase() + segment.slice(1),
    //       isHiddenOnMobile: false
    //     });
    //   } else {
    //     items.push({ 
    //       label: segment.charAt(0).toUpperCase() + segment.slice(1),
    //       href: currentPath,
    //       isHiddenOnMobile: true
    //     });
    //   }
    // });
  
    return items;
  };
  return (
    // 2. 使用 Sidebar 组件，传入面包屑数据和页面内容
    <SidebarLayout breadcrumbItems={generateBreadcrumbs()}>
      <main className="mt-16 overflow-auto h-[calc(100vh-4rem)]">
        {children}
      </main>
    </SidebarLayout>
  );
}