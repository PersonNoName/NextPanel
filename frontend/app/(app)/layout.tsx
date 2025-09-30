
import SidebarLayout from "@/layout/sidebarLayout"


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

  return (
    // 2. 使用 Sidebar 组件，传入面包屑数据和页面内容
    <SidebarLayout breadcrumbItems={breadcrumbItems}>
      {/* 页面主体内容（原代码中的 {children}） */}
      <div className="p-4">
        <h1>Data Fetching</h1>
        <p>这是数据请求页面的内容...</p>
      </div>
    </SidebarLayout>
  );
}