"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Phone,
  FileText,
  Users,
  ClipboardList,
  Network,
  Headset,
  Calendar,
  Settings,
  LogOut,
  Shield,
  HelpCircle,
  CreditCard,
  MessageSquare,
  User,
} from "lucide-react";
import { cn } from "../../../lib/utils";

const sidebarNavItems = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutGrid,
  },
  {
    title: "Assistants",
    href: "/dashboard/assistants",
    icon: Users,
  },
  {
    title: "Phone Numbers",
    href: "/dashboard/phone-numbers",
    icon: Phone,
  },
  {
    title: "Files",
    href: "/dashboard/files",
    icon: FileText,
  },
  {
    title: "Calendar",
    href: "/dashboard/calendar",
    icon: Calendar,
  },
  {
    title: "Calls",
    href: "/dashboard/calls",
    icon: Headset,
  },
  {
    title: "API Requests",
    href: "/dashboard/api-requests",
    icon: Network,
  },
  {
    title: "Payments",
    href: "/dashboard/payment",
    icon: MessageSquare,
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: Settings,
  },
  {
    title: "Billing",
    href: "/dashboard/subscription",
    icon: CreditCard,
  },
];

const helpItems = [
  { title: "Help & Support", href: "/dashboard/support", icon: HelpCircle },
  { title: "Privacy Policy", href: "/privacy-policy", icon: Shield },
  { title: "Refund Policy", href: "/refund-policy", icon: CreditCard },
];

export function Sidebar() {
  const pathname = usePathname();

  // Check if a link is active
  const isActive = (href: string) => {
    // Special case for dashboard root to avoid matching all child routes
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    // For all other routes, check exact match or if it's a sub-path
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="fixed top-[57px] left-0 h-[calc(100vh-57px)] flex flex-col bg-base-200/70 backdrop-blur-md w-64 border-r border-base-300/30 overflow-hidden shadow-lg">
      {/* Main Navigation */}
      <div className="flex-1 px-2 py-7 overflow-y-auto scrollbar-thin scrollbar-thumb-base-300/50 scrollbar-track-transparent">
        <ul className="menu menu-md gap-1">
          {sidebarNavItems.map((item) => {
            const isItemActive = isActive(item.href || "");

            return (
              <li key={item.title}>
                <Link
                  href={item.href || "/dashboard"}
                  className={cn(
                    isItemActive
                      ? "bg-primary/20 text-primary font-medium"
                      : "hover:bg-base-300/50"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4",
                      isItemActive ? "text-primary" : "text-base-content/70"
                    )}
                  />
                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* User Profile & Footer */}
      <div className="p-3 border-t border-base-300/30 bg-base-300/30 backdrop-blur-md">
        {/* Help & Policy Icons */}
        <div className="flex justify-center gap-4 mb-3">
          {helpItems.map((item) => (
            <div key={item.title} className="tooltip" data-tip={item.title}>
              <Link
                href={item.href}
                className="btn btn-circle btn-ghost btn-xs"
              >
                <item.icon className="h-4 w-4 text-base-content/70 hover:text-base-content" />
              </Link>
            </div>
          ))}
        </div>

        <p className="text-xs text-center text-base-content/50">
          © {new Date().getFullYear()} Elide Pro. All rights reserved.
        </p>
      </div>
    </div>
  );
}
