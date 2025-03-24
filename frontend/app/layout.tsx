import "./globals.css";
import { Metadata } from "next";
import ClientLayout from "./utils/client-layout";

export const metadata: Metadata = {
  title: "ElidePro - elidepro.com",
  description:
    "Automate discovery calls with AI, empowering your sales team to focus on closing deals faster.",
  openGraph: {
    title: "ElidePro - elidepro.com",
    description:
      "Automate discovery calls with AI, empowering your sales team to focus on closing deals faster.",
    url: "https://elidepro.com/",
    siteName: "elidepro.com",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ElidePro - elidepro.com",
    description:
      "Automate discovery calls with AI, empowering your sales team to focus on closing deals faster.",
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://elidepro.com/",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning data-theme="dark">
      <body className="min-h-screen antialiased bg-base-200 font-sans">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
