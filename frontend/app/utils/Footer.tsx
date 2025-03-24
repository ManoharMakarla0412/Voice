import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FaLinkedin, FaFacebook, FaTwitter, FaGithub } from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral text-neutral-content">
      {/* Main footer content */}
      <div className="footer p-10 max-w-7xl mx-auto">
        {/* Logo and Description */}
        <div>
          <Link href="/" className="inline-block">
            <Image
              src="/images/logo.png"
              alt="Elide Pro Logo"
              width={120}
              height={120}
              className="mb-2"
            />
          </Link>
          <p className="w-80 text-sm opacity-75">
            Elide Pro - Streamlining the discovery phase of sales calls with
            AI-powered automation. Making your sales process smarter, faster,
            and more effective.
          </p>

          {/* Social Media Icons */}
          <div className="mt-4 flex gap-4">
            <Link
              href="https://www.linkedin.com/company/elidepro"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-circle btn-sm btn-ghost"
            >
              <FaLinkedin className="w-5 h-5" />
            </Link>
            <Link
              href="https://www.facebook.com/elidepro"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-circle btn-sm btn-ghost"
            >
              <FaFacebook className="w-5 h-5" />
            </Link>
            <Link
              href="https://twitter.com/elidepro"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-circle btn-sm btn-ghost"
            >
              <FaTwitter className="w-5 h-5" />
            </Link>
            <Link
              href="https://github.com/elidepro"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-circle btn-sm btn-ghost"
            >
              <FaGithub className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Product Links */}
        <div>
          <span className="footer-title">Product</span>
          <Link href="/features" className="link link-hover">
            Features
          </Link>
          <Link href="/pricing" className="link link-hover">
            Pricing
          </Link>
          <Link href="/integrations" className="link link-hover">
            Integrations
          </Link>
          <Link href="/enterprise" className="link link-hover">
            Enterprise
          </Link>
          <Link href="/demo" className="link link-hover">
            Request Demo
          </Link>
        </div>

        {/* Resources Links */}
        <div>
          <span className="footer-title">Resources</span>
          <Link href="/docs" className="link link-hover">
            Documentation
          </Link>
          <Link href="/blog" className="link link-hover">
            Blog
          </Link>
          <Link href="/community" className="link link-hover">
            Community
          </Link>
          <Link href="/support" className="link link-hover">
            Support
          </Link>
          <Link href="/tutorials" className="link link-hover">
            Tutorials
          </Link>
        </div>

        {/* Company Links */}
        <div>
          <span className="footer-title">Company</span>
          <Link href="/about" className="link link-hover">
            About
          </Link>
          <Link href="/careers" className="link link-hover">
            Careers
          </Link>
          <Link href="/contact" className="link link-hover">
            Contact
          </Link>
          <Link href="/legal" className="link link-hover">
            Legal
          </Link>
          <Link href="/partners" className="link link-hover">
            Partners
          </Link>
        </div>

        {/* Legal Links - Replacing Newsletter */}
        <div>
          <span className="footer-title">Legal</span>
          <Link href="/privacy-policy" className="link link-hover">
            Privacy Policy
          </Link>
          <Link href="/terms-and-conditions" className="link link-hover">
            Terms of Service
          </Link>
          <Link href="/refund-policy" className="link link-hover">
            Refund Policy
          </Link>
          <Link href="/cookies" className="link link-hover">
            Cookie Policy
          </Link>
          <Link href="/gdpr" className="link link-hover">
            GDPR Compliance
          </Link>
        </div>
      </div>

      
    </footer>
  );
};

export default Footer;
