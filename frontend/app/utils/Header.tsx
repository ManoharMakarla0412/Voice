// components/Header.tsx
import React from 'react';
import Link from 'next/link'; 

import Image from 'next/image';
import logo from "../../public/images/logo.png"

const Header: React.FC = () => {
  return (
    <header className="border-b border-gray-800 bg-black/50 backdrop-blur-xs sticky top-0 z-10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
           <Image src = {logo}
           alt = "Elide Pro Logo"
           width = {120}
           height = {120}
           
           />

          </Link>
        </div>
        <nav className="hidden md:flex space-x-8">
          <Link href="/" className="text-gray-300 hover:text-white transition-colors">
            Home
          </Link>
          <Link href="/features" className="text-gray-300 hover:text-white transition-colors">
            Features
          </Link>
          <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors">
            Pricing
          </Link>
          <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
            Contact
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          <Link href="/login" className="px-4 py-2 rounded-md text-gray-300 hover:text-white transition-colors">
            Log in
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 rounded-md bg-linear-to-r from-blue-500 to-purple-600 text-white font-medium hover:opacity-90 transition-opacity"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  </header>
   
  );
};

export default Header;