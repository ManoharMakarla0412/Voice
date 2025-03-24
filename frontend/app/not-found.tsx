"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "../public/images/logo.png";

const NotFoundPage: React.FC = () => {
  const router = useRouter();

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-base-100 rounded-lg shadow-xl overflow-hidden">
        <div className="p-8">
          {/* Logo Header */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Image
                src={logo}
                alt="Logo"
                width={120}
                height={120}
                className="drop-shadow-md"
              />
            </div>
          </div>

          {/* 404 Text with Accent */}
          <div className="text-center mb-8">
            <h1 className="font-bold text-8xl text-primary mb-2">404</h1>
            <h2 className="font-semibold text-2xl mb-4">Page Not Found</h2>
            <div className="divider max-w-xs mx-auto"></div>
            <p className="text-base-content/70 mt-4">
              Oops! The page you're looking for seems to have wandered off.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 justify-center mt-6">
            <button className="btn btn-primary" onClick={handleGoHome}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Return Home
            </button>
            <button className="btn btn-outline" onClick={() => router.back()}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Go Back
            </button>
          </div>
        </div>

        {/* Bottom Decorative Element */}
        <div className="bg-primary h-2 w-full"></div>
      </div>
    </div>
  );
};

export default NotFoundPage;
