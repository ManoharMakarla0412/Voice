"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PaymentFailurePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to signup page after 3 seconds
    const timer = setTimeout(() => {
      router.push("/signup");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-2xl font-semibold mb-4 text-red-500">
          Payment Setup Failed
        </h1>
        <p className="text-gray-400">
          Failed to set up autopay. Redirecting to signup...
        </p>
      </div>
    </div>
  );
}