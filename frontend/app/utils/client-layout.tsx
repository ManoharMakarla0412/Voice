"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "../dashboard/components/sidebar";
import { Navbar } from "../dashboard/components/user-nav";

// Pages that should show the auth layout (no sidebar)
const authPages = [
  "/login",
  "/signup",
  "/privacy",
  "/",
  "/terms-and-conditions",
  "/refund-policy",
];

// Pages that should show the dashboard layout (with sidebar)
const validRoutesPrefixes = [
  "/dashboard",
  "/dashboard/assistants",
  "/dashboard/phone-numbers",
  "/dashboard/files",
  "/dashboard/tools",
  "/dashboard/blocks",
  "/dashboard/calls",
  "/dashboard/api-requests",
  "/dashboard/webhooks",
  "/dashboard/calendly",
];

const isValidRoute = (pathname: string | null): boolean => {
  if (!pathname) return false;
  return validRoutesPrefixes.some((prefix) => pathname.startsWith(prefix));
};

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());
  const pathname = usePathname();
  const isLoggedIn = isValidRoute(pathname);
  const [mounted, setMounted] = useState(false);

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-base-100"></div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      {/* Main content area */}
      {isLoggedIn ? (
        // DASHBOARD LAYOUT - For logged-in users
        <div className="min-h-screen flex flex-col">
          {/* Dashboard navigation */}
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60">
            <Navbar />
          </header>

          <div className="flex-1 flex">
            {/* Always visible sidebar - We're hiding this but using its width for spacing */}
            <div className="w-64 shrink-0">
              {/* Sidebar with fixed positioning */}
              <Sidebar />
            </div>

            {/* Main content + footer container */}
            <div className="flex-1 flex flex-col overflow-x-auto">
              {/* Main dashboard content */}
              <main className="flex-1">{children}</main>
            </div>
          </div>
        </div>
      ) : (
        // AUTH/MARKETING LAYOUT - For non-logged-in users
        <div className="min-h-screen flex flex-col">
          {/* Public site header */}

          {/* Public site content without extra padding */}
          <main className="flex-1">{children}</main>
        </div>
      )}
    </QueryClientProvider>
  );
}
