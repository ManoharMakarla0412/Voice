// components/TermsAndConditions.tsx
import React from 'react';
import Link from 'next/link';

const TermsAndConditions: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Terms and Conditions</h1>
          <p className="mt-2 text-sm text-gray-600">Last Updated: January 08, 2025</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-white shadow-sm overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <section className="prose prose-lg text-gray-700 max-w-none">
                <p>
                  Welcome to <span className="font-semibold">Elide Pro</span>! These Terms and Conditions outline the rules and regulations for the use of our website and services. By accessing or using Elide Pro, you agree to comply with these terms. If you do not agree with any part of these terms, please do not use our services.
                </p>

                <h2>1. Acceptance of Terms</h2>
                <p>
                  By using our website and services, you confirm that you are at least 18 years old and have the legal capacity to enter into these Terms and Conditions. If you are using the services on behalf of a company or organization, you represent that you have the authority to bind that entity to these terms.
                </p>

                <h2>2. Services Provided</h2>
                <p>
                  Elide Pro offers automated sales call management solutions designed to streamline the discovery phase of sales calls. Our services include but are not limited to lead qualification, call automation, and integration with customer relationship management (CRM) systems.
                </p>

                <h2>3. User Accounts</h2>
                <p>
                  To access certain features of our services, you may need to create an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
                </p>

                <h2>4. Payment Terms</h2>
                <p>
                  By subscribing to our services, you agree to pay all fees associated with your chosen plan. Payment is due upon subscription and will be billed monthly or annually as specified during the signup process. We reserve the right to change our pricing at any time; however, existing subscribers will be notified prior to any changes.
                </p>

                <h2>5. Cancellation and Refund Policy</h2>
                <p>
                  You may cancel your subscription at any time through your account settings. Refunds will be provided according to our refund policy, which is available on our website.
                </p>

                <h2>6. User Conduct</h2>
                <p>
                  You agree not to use our services for any unlawful purpose or in a manner that could damage, disable, overburden, or impair the website or interfere with any other party’s use of the services. Prohibited activities include but are not limited to:
                </p>
                <ul>
                  <li>Sending unsolicited communications (spam)</li>
                  <li>Impersonating any person or entity</li>
                  <li>Transmitting harmful or malicious code</li>
                </ul>

                <h2>7. Intellectual Property</h2>
                <p>
                  All content on Elide Pro, including text, graphics, logos, and software, is the property of Elide Pro or its licensors and is protected by copyright and intellectual property laws. You may not reproduce, distribute, or create derivative works from any content without our express written consent.
                </p>

                <h2>8. Limitation of Liability</h2>
                <p>
                  To the fullest extent permitted by law, Elide Pro shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services or inability to access them.
                </p>

                <h2>9. Indemnification</h2>
                <p>
                  You agree to indemnify and hold harmless Elide Pro and its affiliates from any claims, losses, liabilities, damages, costs, or expenses (including reasonable attorneys’ fees) arising out of your use of our services or violation of these Terms and Conditions.
                </p>

                <h2>10. Changes to Terms</h2>
                <p>
                  We reserve the right to modify these Terms and Conditions at any time. We will notify you of significant changes via email or through a notice on our website. Your continued use of our services after such changes constitutes your acceptance of the new terms.
                </p>

                <h2>11. Governing Law</h2>
                <p>
                  These Terms and Conditions shall be governed by and construed in accordance with the laws of Hyderabad, Telangana. Any disputes arising out of or related to these terms shall be resolved in the courts located in Hyderabad.
                </p>

                <h2>12. Contact Information</h2>
                <p>
                  If you have any questions about these Terms and Conditions, please contact us at:
                </p>
                <p>
                  <strong>Email:</strong>{' '}
                  <a href="mailto:support@elidepro.com" className="text-blue-600 hover:underline">
                    support@elidepro.com
                  </a>
                  <br />
                  <strong>Address:</strong> 7th Floor, Asian Suncity, Kothaguda, Kondapur, Hyderabad – 500084
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold">Transform Conversations into Conversions!</h3>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Legal</h3>
              <ul className="mt-2 space-y-2">
                <li>
                  <Link href="/terms" className="hover:underline">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:underline">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/refund" className="hover:underline">
                    Refund Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Follow Us</h3>
              <ul className="mt-2 space-y-2">
                <li>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    Facebook
                  </a>
                </li>
                <li>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    Twitter
                  </a>
                </li>
                <li>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-6 border-t border-gray-700 pt-4 text-center">
            <p>© 2025 ElidePro. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TermsAndConditions;