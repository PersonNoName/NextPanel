import SidebarNavItem from './SidebarNavItem';

import { HomeIcon } from '@heroicons/react/24/outline';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { CogIcon } from '@heroicons/react/24/outline';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

interface NavItem {
  id: number;
  name: string;
  icon: React.ReactNode;
  href: string;
}


export default function SidebarItem() {
    const navItems: NavItem[] = [
        { id: 1, name: '仪表盘', icon: <HomeIcon className="w-5 h-5" />, href: '#' },
        { id: 2, name: '分析', icon: <ChartBarIcon className="w-5 h-5" />, href: '#' },
        { id: 3, name: '用户', icon: <UserGroupIcon className="w-5 h-5" />, href: '#' },
        { id: 4, name: '文档', icon: <DocumentTextIcon className="w-5 h-5" />, href: '#' },
        { id: 5, name: '设置', icon: <CogIcon className="w-5 h-5" />, href: '#' },
    ];
  return (
    <div>
      {navItems.map(item => (
        <SidebarNavItem key={item.id} item={item} />
      ))}
    </div>
  )
}