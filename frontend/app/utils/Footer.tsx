import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FaLinkedin, FaFacebook, FaTwitter } from "react-icons/fa"; // Import icons from react-icons

const logo = "/images/logo.png"; // Replace with your actual logo path

const Footer: React.FC = () => {
  return (
    <footer className="bg-black border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div>
            <Link href="/" className="flex items-center">
              <Image
                src={logo}
                alt="Elide Pro Logo"
                width={120}
                height={120}
              />
            </Link>
            <p className="mt-4 text-gray-400">
              Streamlining the discovery phase of sales calls with AI-powered automation.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  Integrations
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  Enterprise
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  Community
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  Legal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          {/* Copyright */}
          <p className="text-gray-400 text-sm">© {new Date().getFullYear()} Elide Pro. All rights reserved.</p>

          {/* Policy Links */}
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-and-conditions" className="text-gray-400 hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/refund-policy" className="text-gray-400 hover:text-white transition-colors">
            Refund Policy
            </Link>
          </div>

          {/* Social Media Links with Icons */}
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="https://www.linkedin.com/company/elidepro" target="_blank" rel="noopener noreferrer">
              <FaLinkedin className="w-6 h-6 text-gray-400 hover:text-white transition-colors" />
            </Link>
            <Link href="https://www.facebook.com/elidepro" target="_blank" rel="noopener noreferrer">
              <FaFacebook className="w-6 h-6 text-gray-400 hover:text-white transition-colors" />
            </Link>
            <Link href="https://twitter.com/elidepro" target="_blank" rel="noopener noreferrer">
              <FaTwitter className="w-6 h-6 text-gray-400 hover:text-white transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
