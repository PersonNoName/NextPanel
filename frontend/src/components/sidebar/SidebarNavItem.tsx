import Link from "next/link";

interface NavItem {
  id: number;
  name: string;
  icon: React.ReactNode;
  href: string;
}

interface SidebarNavItemProps {
  item: NavItem;
}

export default function SidebarNavItem({ item }: SidebarNavItemProps) {
    return (
        <Link href={item.href} className="flex items-center gap-2">
            {item.icon}
            <span className="text-sm font-medium">{item.name}</span>
        </Link>
    )
}