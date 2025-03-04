"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page after 3 seconds
    const timer = setTimeout(() => {
      router.push("/login");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-2xl font-semibold mb-4">
          Payment Setup Successful!
        </h1>
        <p className="text-gray-400">
          Your autopay has been set up. Redirecting to login...
        </p>
      </div>
    </div>
  );
}