"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconHome, IconFileText, IconFolder, IconSettings, IconChevronRight, IconChevronLeft } from "@tabler/icons-react";
import { motion } from "framer-motion";

interface SidebarItem {
  name: string;
  icon: React.ElementType;
  link: string;
}

interface SidebarProps {
  items: SidebarItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ items }) => {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  return (
    <aside
      className={`flex h-screen flex-col overflow-y-auto border-r bg-white px-5 py-8 transition-all duration-300 ${
        open ? "w-64" : "w-20"
      }`}
    >
      <div className="mt-6 flex flex-1 flex-col justify-between">
        <nav className="-mx-3 space-y-6">
          <div className="space-y-3">
            {items.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link
                  key={index}
                  href={item.link}
                  className={`flex transform items-center rounded-lg px-3 py-2 text-gray-600 transition-colors duration-300 hover:bg-gray-100 hover:text-gray-700 ${
                    pathname === item.link ? "bg-gray-100 text-gray-700" : ""
                  } group`}
                >
                  <Icon size={20} />
                  <motion.span
                    initial={open ? { opacity: 1 } : { opacity: 0 }}
                    animate={open ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mx-2 text-sm font-medium"
                  >
                    {item.name}
                  </motion.span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
      <button
        onClick={() => setOpen(!open)}
        className="mt-6 flex items-center justify-center rounded-lg bg-gray-100 p-2 hover:bg-gray-200"
      >
        {open ? (
          <IconChevronLeft size={20} className="text-gray-600" />
        ) : (
          <IconChevronRight size={20} className="text-gray-600" />
        )}
      </button>
    </aside>
  );
};

// Example usage
export const SidebarDemo: React.FC = () => {
  const sidebarItems: SidebarItem[] = [
    { name: "Home", icon: IconHome, link: "/" },
    { name: "All Pages", icon: IconFileText, link: "/wiki" },
    { name: "Categories", icon: IconFolder, link: "#" },
    { name: "Settings", icon: IconSettings, link: "#" },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar items={sidebarItems} />
      <div className="flex-1 p-10">
        <h1 className="text-2xl font-bold">Main Content Area</h1>
        <p>Your page content goes here.</p>
      </div>
    </div>
  );
};
