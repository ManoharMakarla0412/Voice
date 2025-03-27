import "./globals.css";
import { Metadata } from "next";
import ClientLayout from "./utils/client-layout";

export const metadata: Metadata = {
  title: "Voice Assistant Platform",
  description: "Your AI voice assistant platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="custom" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
