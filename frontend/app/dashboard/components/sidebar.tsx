"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LayoutGrid,
  Phone,
  FileText,
  Users,
  ClipboardList,
  Network,
  Headset,
  ChevronDown,
  Calendar,
} from "lucide-react";
import { cn } from "../../../lib/utils";

const sidebarNavItems = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutGrid,
  },
  {
    title: "Platform",
    icon: Network,
    children: [
      { title: "Assistants", href: "/dashboard/assistants", icon: Users },
      { title: "Phone Numbers", href: "/dashboard/phone-numbers", icon: Phone },
      { title: "Files", href: "/dashboard/files", icon: FileText },
      { title: "Calendar", href: "/dashboard/calender", icon: Calendar },
    ],
  },
  {
    title: "Logs",
    icon: ClipboardList,
    children: [
      { title: "Calls", href: "/dashboard/calls", icon: Headset },
      {
        title: "API Requests",
        href: "/dashboard/api-requests",
        icon: Network,
      },
    ],
  },
];

export function Sidebar() {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const currentYear = new Date().getFullYear();

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <div className="fixed top-[57px] left-0 h-[calc(100vh-57px)] flex flex-col bg-base-300 w-64 border-r border-base-200 overflow-y-auto">
      {/* Main Menu (scrollable if needed) */}
      <div className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="menu menu-md w-full">
          {sidebarNavItems.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isOpen = openMenus[item.title];

            if (!hasChildren) {
              return (
                <li key={item.title}>
                  <Link
                    href={item.href || "/dashboard"}
                    className={cn(
                      "flex items-center gap-3 my-1 font-medium",
                      "hover:bg-base-200 active:bg-primary active:text-primary-content"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </li>
              );
            }

            return (
              <li key={item.title} className="my-1">
                <details open={isOpen} onChange={() => toggleMenu(item.title)}>
                  <summary
                    className={cn(
                      "font-medium hover:bg-base-200",
                      isOpen && "font-semibold"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </summary>
                  <ul className="pl-4 mt-1">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className={cn(
                            "flex items-center gap-3 py-2",
                            "hover:bg-base-200 active:bg-primary active:text-primary-content"
                          )}
                        >
                          <child.icon className="h-3.5 w-3.5" />
                          <span className="text-sm">{child.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Footer */}
      <div className="p-3 text-center border-t border-base-200 bg-base-200">
        <p className="text-xs opacity-70">
          © {currentYear} Elide Pro. All rights reserved.
        </p>
      </div>
    </div>
  );
}
