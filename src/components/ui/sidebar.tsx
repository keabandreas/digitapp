import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";

interface SidebarProps {
  items: {
    name: string;
    icon: LucideIcon;
    link: string;
  }[];
}

export const Sidebar = ({ items }: SidebarProps) => {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col overflow-y-auto border-r bg-white px-5 py-8">
      <div className="mt-6 flex flex-1 flex-col justify-between">
        <nav className="-mx-3 space-y-6 ">
          <div className="space-y-3 ">
            {items.map((item, index) => (
              <Link
                key={index}
                href={item.link}
                className={`flex transform items-center rounded-lg px-3 py-2 text-gray-600 transition-colors duration-300 hover:bg-gray-100 hover:text-gray-700 ${
                  pathname === item.link ? "bg-gray-100 text-gray-700" : ""
                }`}
              >
                <item.icon className="h-5 w-5" aria-hidden="true" />
                <span className="mx-2 text-sm font-medium">{item.name}</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </aside>
  );
};
