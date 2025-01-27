"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ScrollArea } from "../../../components/ui/scroll-area";
import {
  LayoutGrid,
  Phone,
  FileText,
  PenTool,
  Users,
  ClipboardList,
  Network,
  Blocks,
  Webhook,
  UserCircle,
  Headset,
  ChevronDown,
  ChevronRight,
  Calendar,
  WalletCards,
  Presentation,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { hrtime } from "process";

const sidebarNavItems = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutGrid,
  },
  {
    title: "Integration",
    href: "/dashboard/calendly",
    icon: Blocks,
  },
  {
    title: "Platform",
    icon: Network,
    children: [
      { title: "Assistants", href: "/dashboard/assistants", icon: Users },
      { title: "Phone Numbers", href: "/dashboard/phone-numbers", icon: Phone },
      { title: "Files", href: "/dashboard/files", icon: FileText },
      { title: "Calender", href: "/dashboard/calender", icon: Calendar },
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
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: UserCircle,
  },
  {
    title: "Payment",
    href: "/dashboard/payment",
    icon: WalletCards,
    
  },
  {
    title: "Events",
    href: "/dashboard/events",
    icon: Presentation
  }
];

export function Sidebar() {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <div className="hidden lg:block w-64 bg-[#050505] text-gray-200 h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-center h-16 border-b border-gray-800">
          <h1 className="text-xl font-bold">ELIDE</h1>
        </div>
        <ScrollArea className="flex-1 px-4">
          <nav className="space-y-2 py-4">
            {sidebarNavItems.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isOpen = openMenus[item.title];

              return (
                <div key={item.title} className="space-y-1">
                  {hasChildren ? (
                    <div>
                      <button
                        onClick={() => toggleMenu(item.title)}
                        className={cn(
                          "w-full flex items-center justify-between text-sm rounded-md px-3 py-2 transition-colors hover:bg-gray-800 hover:text-white",
                          isOpen && "bg-gray-800 text-white"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          {item.title}
                        </div>
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="ml-4 space-y-1 pt-2">
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={cn(
                                "w-full flex items-center justify-start gap-2 text-sm rounded-md px-3 py-2 transition-colors hover:bg-gray-800 hover:text-white"
                              )}
                            >
                              <child.icon className="h-4 w-4" />
                              {child.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href || "/dashboard"}
                      className={cn(
                        "w-full flex items-center justify-start gap-2 text-sm rounded-md px-3 py-2 transition-colors hover:bg-gray-800 hover:text-white"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>
        </ScrollArea>
      </div>
    </div>
  );
}
