"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import "./globals.css";
import { AuthLayout } from "../components/layout/auth-layout";
import AppLayout from "../components/layout/app-layout";
import { createClient } from '@supabase/supabase-js';

import { SessionContextProvider } from '@supabase/auth-helpers-react';

const supabaseUrl="https://ojinoonzmmrafzdldhoi.supabase.co"
const supabaseKey="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qaW5vb256bW1yYWZ6ZGxkaG9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5NzA5MDgsImV4cCI6MjA1MzU0NjkwOH0.PLUn73GXOOo0FrsrgBDbgihOddY2LlOdyxb9DcZ1t9U"
const supabase = createClient(supabaseUrl, supabaseKey)

const authPages = ["/login", "/signup", "/privacy", "/"];
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
  "/dashboard/calendly"
];

const isValidRoute = (pathname: string): boolean => {
  return validRoutesPrefixes.some((prefix) => pathname.startsWith(prefix));
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());
  const pathname = usePathname();
  const isAuthPage = authPages.includes(pathname);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased bg-[#1C1C1C] font-sans">
        <QueryClientProvider client={queryClient}>
        <SessionContextProvider supabaseClient={supabase}>
            {isAuthPage || !isValidRoute(pathname) ? (
              <AuthLayout>{children}</AuthLayout>
            ) : (
              <AppLayout>{children}</AppLayout>
            )}
                </SessionContextProvider>

        </QueryClientProvider>
      </body>
    </html>
  );
}
