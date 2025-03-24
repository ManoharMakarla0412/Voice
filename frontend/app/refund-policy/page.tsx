import React from 'react';


const RefundPolicy: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-linear-to-b from-gray-900 to-black">
      {/* Reusable Header */}
    

      {/* Main Content */}
      <main className="grow">
        <div className="max-w-6xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-16">
            <div className="inline-block p-1 rounded-lg bg-linear-to-r from-blue-500 to-purple-600 mb-6">
              <div className="bg-black px-4 py-1 rounded-md">
                <span className="text-gray-300 text-sm">Effective Date: February 18, 2025</span>
              </div>
            </div>
            <h1 className="text-5xl font-bold text-white mb-6 bg-linear-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Refund Policy
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
              At <span className="font-semibold text-white">ElidePro.com</span>, we value customer satisfaction and
              strive to provide a seamless refund process. Please review our refund policy below.
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-12 text-gray-300">
            <section className="bg-gray-800/20 rounded-2xl p-8 backdrop-blur-xs border border-gray-800 hover:border-gray-700 transition-colors">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 mr-3 text-sm">
                  1
                </span>
                Refund Eligibility
              </h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                We offer refunds under the following conditions:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-300">
                <li>The request is made within 1 day of purchase.</li>
                <li>
                  The product/service is defective, not as described, or did not meet expectations due to an error on our
                  end.
                </li>
                <li>You have contacted our support team and attempted to resolve the issue.</li>
              </ul>
            </section>

            <section className="bg-gray-800/20 rounded-2xl p-8 backdrop-blur-xs border border-gray-800 hover:border-gray-700 transition-colors">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 mr-3 text-sm">
                  2
                </span>
                Non-Refundable Items
              </h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Refunds will not be issued for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-300">
                <li>Digital products/services that have been accessed, downloaded, or used.</li>
                <li>Subscription-based services after the trial period.</li>
                <li>Change of mind or accidental purchases.</li>
              </ul>
            </section>

            <section className="bg-gray-800/20 rounded-2xl p-8 backdrop-blur-xs border border-gray-800 hover:border-gray-700 transition-colors">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 mr-3 text-sm">
                  3
                </span>
                Refund Process
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-300">
                <li>
                  <strong className="text-white">Refund Initiation:</strong> Once your request is approved, we will
                  initiate the refund within 2 business days.
                </li>
                <li>
                  <strong className="text-white">Refund Credit Time:</strong> The refunded amount will be credited to
                  your original payment method within 2 business days, depending on your payment provider.
                </li>
              </ul>
            </section>

            <section className="bg-gray-800/20 rounded-2xl p-8 backdrop-blur-xs border border-gray-800 hover:border-gray-700 transition-colors">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 mr-3 text-sm">
                  4
                </span>
                How to Request a Refund
              </h2>
              <ol className="list-decimal pl-6 space-y-2 text-gray-300">
                <li>
                  Contact us at{' '}
                  <a
                    href="mailto:support@elidepro.com"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    support@elidepro.com
                  </a>{' '}
                  with your order details.
                </li>
                <li>Provide a reason for the refund request along with any necessary supporting information.</li>
                <li>Our team will review and respond within 24 hours.</li>
              </ol>
            </section>

            <section className="bg-gray-800/20 rounded-2xl p-8 backdrop-blur-xs border border-gray-800 hover:border-gray-700 transition-colors">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 mr-3 text-sm">
                  5
                </span>
                Contact Us
              </h2>
              <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                <p className="text-gray-300">
                  📧{' '}
                  <a
                    href="mailto:support@elidepro.com"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    support@elidepro.com
                  </a>
                </p>
                <p className="text-gray-300 mt-2">
                  📞{' '}
                  <a href="tel:+919848000149" className="text-blue-400 hover:text-blue-300 transition-colors">
                    9848000149
                  </a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Reusable Footer */}
      
    </div>
  );
};

export default RefundPolicy;