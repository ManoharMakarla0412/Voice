"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutGrid,
  Phone,
  FileText,
  Blocks,
  Users,
  ClipboardList,
  Network,
  UserCircle,
  LogOut,
  Menu,
  Headset,
  ChevronDown,
  Calendar,
  Presentation,
  WalletCards,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { Button } from "../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../components/ui/collapsible";
import dynamic from "next/dynamic";
import logo from "../../../public/images/logo.png";

const NavbarItems = [
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

const ClientSideImage = dynamic(() => import("next/image"), { ssr: false });

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isClient, setIsClient] = useState(false);

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

  useEffect(() => {
    const updateWidth = () => setWindowWidth(window.innerWidth);
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const isMobile = windowWidth < 768;

  const NavItem = ({ item, onClick }: { item: any; onClick?: () => void }) => {
    const isActive = pathname === item.href;

    if (item.children) {
      return (
        <Collapsible className="w-full">
          <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-lg px-4 py-2 text-left transition-all duration-200 hover:bg-white/10">
            <div className="flex items-center">
              <item.icon className="mr-2 h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
              <span className="font-medium text-gray-200 group-hover:text-white transition-colors">
                {item.title}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors transform group-data-[state=open]:rotate-180 duration-200" />
          </CollapsibleTrigger>
          <CollapsibleContent className="ml-4 space-y-1 mt-1">
            {item.children.map((child: any) => (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  "flex items-center rounded-lg px-4 py-2 transition-all duration-200",
                  "hover:bg-white/10 group",
                  pathname === child.href ? "bg-white/15" : "text-gray-300"
                )}
                onClick={onClick}
              >
                <child.icon className="mr-2 h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                <span className="font-medium group-hover:text-white transition-colors">
                  {child.title}
                </span>
              </Link>
            ))}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center rounded-lg px-4 py-2 transition-all duration-200",
          "hover:bg-white/10 group",
          isActive ? "bg-white/15" : "text-gray-300"
        )}
        onClick={onClick}
      >
        <item.icon className="mr-2 h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
        <span className="font-medium group-hover:text-white transition-colors">
          {item.title}
        </span>
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl backdrop-saturate-150 bg-black/70 border-b border-white/10">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden hover:bg-white/10 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Menu className="h-6 w-6 text-white" />
          </Button>

          <Link href="/dashboard" className="relative flex items-center">
            {isClient && (
              <div className="relative h-8 w-32">
                <ClientSideImage
                  src={logo}
                  alt="Logo"
                  layout="fill"
                  objectFit="contain"
                  priority
                  className="transition-transform duration-200 hover:scale-105"
                />
              </div>
            )}
          </Link>
        </div>

        {/* Profile Menu */}
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full ring-2 ring-white/10 hover:ring-white/20 transition-all duration-200"
              >
                <Avatar className="h-10 w-10 transition-transform duration-200 hover:scale-105">
                  <AvatarImage src="/avatars/01.png" alt={username} />
                  <AvatarFallback className="bg-white/10 text-white">
                    {getInitials(username)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 backdrop-blur-xl backdrop-saturate-150 bg-black/90 border border-white/10"
              align="end"
            >
              <DropdownMenuLabel className="text-white">
                <div className="flex flex-col space-y-1">
                  <span className="font-medium">{username}</span>
                  <span className="text-sm text-gray-400">{email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="text-gray-200 focus:text-white focus:bg-white/10"
                  onClick={() => router.push("/dashboard/profile")}
                >
                  <UserCircle className="mr-2 h-5 w-5" />
                  <span>Profile</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-400 focus:text-red-300 focus:bg-white/10"
              >
                <LogOut className="mr-2 h-5 w-5" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobile && (
        <div
          className={cn(
            "fixed inset-0 top-16 z-50 backdrop-blur-xl backdrop-saturate-150 bg-black/70 transition-opacity duration-200",
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={() => setIsOpen(false)}
        >
          <nav
            className={cn(
              "absolute left-0 top-0 bottom-0 w-72 backdrop-blur-xl backdrop-saturate-150 bg-black/90 border-r border-white/10 p-4 shadow-xl transition-transform duration-300 ease-in-out",
              isOpen ? "translate-x-0" : "-translate-x-full"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-2">
              {NavbarItems.map((item) => (
                <NavItem
                  key={item.title}
                  item={item}
                  onClick={() => setIsOpen(false)}
                />
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
