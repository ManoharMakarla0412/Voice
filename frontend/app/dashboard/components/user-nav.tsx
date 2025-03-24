"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutGrid,
  Phone,
  FileText,
  Users,
  ClipboardList,
  Network,
  UserCircle,
  LogOut,
  Menu,
  Headset,
  Calendar,
  Bell,
  Search,
} from "lucide-react";
import Image from "next/image";

// This matches your existing NavbarItems structure
const NavbarItems = [
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
      { title: "Calender", href: "/dashboard/calendly", icon: Calendar },
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

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const email = sessionStorage.getItem("email");
    const username = sessionStorage.getItem("username");
    if (email && username) {
      setUsername(username);
      setEmail(email);
    }
  }, []);

  const handleLogout = () => {
    router.push("/");
    sessionStorage.clear();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // This is only for mobile view - your sidebar handles desktop navigation
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="navbar bg-base-100/90 backdrop-blur-md border-b border-base-300 h-16 px-4">
      <div className="navbar-start">
        {/* Mobile menu button - only visible on mobile */}
        <div className="lg:hidden">
          <label
            htmlFor="my-drawer-2"
            className="btn btn-ghost btn-circle drawer-button"
          >
            <Menu className="h-5 w-5" />
          </label>
        </div>

        {/* Logo */}
        {isClient && (
          <Link href="/dashboard" className="flex items-center ml-2">
            <div className="relative h-8 w-32">
              <Image
                src="/images/logo.png"
                alt="Logo"
                fill
                sizes="128px"
                priority
                className="object-contain"
              />
            </div>
          </Link>
        )}
      </div>

      <div className="navbar-center hidden lg:flex">
        {/* Optional: Search bar in the center */}
        
      </div>

      <div className="navbar-end">
        {/* Notification bell */}
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
            <div className="indicator">
              <Bell className="h-5 w-5" />
              <span className="badge badge-xs badge-primary indicator-item"></span>
            </div>
          </div>
          <div
            tabIndex={0}
            className="mt-3 z-1 card card-compact dropdown-content w-52 bg-base-200 shadow-sm"
          >
            <div className="card-body">
              <span className="font-bold text-lg">Notifications</span>
              <p className="text-sm">You have no new notifications</p>
              <div className="card-actions">
                <button className="btn btn-primary btn-sm btn-block">
                  View all
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* User profile dropdown */}
        <div className="dropdown dropdown-end ml-2">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle avatar ring-3 ring-primary/20 ring-offset-base-100 ring-offset-2"
          >
            <div className="w-10 rounded-full">
              {username ? (
                <div className="bg-primary text-primary-content flex items-center justify-center h-full text-lg font-bold">
                  {getInitials(username)}
                </div>
              ) : (
                <Image
                  src="/avatars/01.png"
                  alt="Avatar"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              )}
            </div>
          </div>
          <ul
            tabIndex={0}
            className="menu dropdown-content z-1 p-2 shadow-sm bg-base-200 rounded-box w-52 mt-4"
          >
            <li className="menu-title px-4 py-2">
              <div className="flex flex-col">
                <span className="font-medium">{username || "User"}</span>
                <span className="text-xs opacity-70">
                  {email || "user@example.com"}
                </span>
              </div>
            </li>
            <div className="divider my-1"></div>
            <li>
              <Link
                href="/dashboard/profile"
                className="flex items-center gap-2"
              >
                <UserCircle className="h-4 w-4" />
                Profile
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="text-error flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
