"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { usePathname } from "next/navigation";
import "./globals.css";
import { AuthLayout } from "../components/layout/auth-layout";
import AppLayout from "../components/layout/app-layout";
import { createClient } from '@supabase/supabase-js';
import { SessionContextProvider } from '@supabase/auth-helpers-react';

const supabaseUrl = "https://ojinoonzmmrafzdldhoi.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qaW5vb256bW1yYWZ6ZGxkaG9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5NzA5MDgsImV4cCI6MjA1MzU0NjkwOH0.PLUn73GXOOo0FrsrgBDbgihOddY2LlOdyxb9DcZ1t9U";
const supabase = createClient(supabaseUrl, supabaseKey);

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
  "/dashboard/calendly",
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
      <head>
        {/* Meta Title */}
        <title>ElidePro - elidepro.com</title>

        {/* Meta Description */}
        <meta
          name="description"
          content="Automate discovery calls with AI, empowering your sales team to focus on closing deals faster."
        />

        {/* Meta Robots */}
        <meta
          name="robots"
          content="index, follow, max-snippet:-1, max-video-preview:-1, max-image-preview:large"
        />

        {/* Canonical Link */}
        <link rel="canonical" href="https://elidepro.com/" />

        {/* Open Graph Tags */}
        <meta property="og:locale" content="en_US" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="ElidePro - elidepro.com" />
        <meta
          property="og:description"
          content="Automate discovery calls with AI, empowering your sales team to focus on closing deals faster."
        />
        <meta property="og:url" content="https://elidepro.com/" />
        <meta property="og:site_name" content="elidepro.com" />
        <meta property="og:updated_time" content="2025-02-17T11:36:04+00:00" />
        <meta
          property="article:published_time"
          content="2025-01-07T20:23:10+00:00"
        />
        <meta
          property="article:modified_time"
          content="2025-02-17T11:36:04+00:00"
        />

        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ElidePro - elidepro.com" />
        <meta
          name="twitter:description"
          content="Automate discovery calls with AI, empowering your sales team to focus on closing deals faster."
        />
        <meta name="twitter:label1" content="Written by" />
        <meta name="twitter:data1" content="unatixglobal@gmail.com" />
        <meta name="twitter:label2" content="Time to read" />
        <meta name="twitter:data2" content="3 minutes" />
      </head>
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