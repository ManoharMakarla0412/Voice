import React from 'react';

const RefundPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-base-100">
      <main className="container mx-auto py-16 px-4">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="badge badge-primary mb-4 p-4">
            <span>Effective Date: February 18, 2025</span>
          </div>
          
          <h1 className="text-5xl font-bold mb-6 text-primary">
            Refund Policy
          </h1>
          
          <p className="text-base-content/80 text-lg max-w-2xl mx-auto">
            At <span className="font-semibold text-base-content">ElidePro.com</span>, we value customer satisfaction and
            strive to provide a seamless refund process. Please review our refund policy below.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title flex items-center gap-3">
                <div className="avatar avatar-placeholder">
                  <div className="bg-primary text-primary-content rounded-full w-8">
                    <span>1</span>
                  </div>
                </div>
                Refund Eligibility
              </h2>
              <p className="text-base-content/80 mb-4">
                We offer refunds under the following conditions:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-base-content/80">
                <li>The request is made within 1 day of purchase.</li>
                <li>
                  The product/service is defective, not as described, or did not meet expectations due to an error on our
                  end.
                </li>
                <li>You have contacted our support team and attempted to resolve the issue.</li>
              </ul>
            </div>
          </div>

          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title flex items-center gap-3">
                <div className="avatar avatar-placeholder">
                  <div className="bg-primary text-primary-content rounded-full w-8">
                    <span>2</span>
                  </div>
                </div>
                Non-Refundable Items
              </h2>
              <p className="text-base-content/80 mb-4">
                Refunds will not be issued for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-base-content/80">
                <li>Digital products/services that have been accessed, downloaded, or used.</li>
                <li>Subscription-based services after the trial period.</li>
                <li>Change of mind or accidental purchases.</li>
              </ul>
            </div>
          </div>

          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title flex items-center gap-3">
                <div className="avatar avatar-placeholder">
                  <div className="bg-primary text-primary-content rounded-full w-8">
                    <span>3</span>
                  </div>
                </div>
                Refund Process
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-base-content/80">
                <li>
                  <strong className="text-base-content">Refund Initiation:</strong> Once your request is approved, we will
                  initiate the refund within 2 business days.
                </li>
                <li>
                  <strong className="text-base-content">Refund Credit Time:</strong> The refunded amount will be credited to
                  your original payment method within 2 business days, depending on your payment provider.
                </li>
              </ul>
            </div>
          </div>

          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title flex items-center gap-3">
                <div className="avatar avatar-placeholder">
                  <div className="bg-primary text-primary-content rounded-full w-8">
                    <span>4</span>
                  </div>
                </div>
                How to Request a Refund
              </h2>
              <ol className="list-decimal pl-6 space-y-2 text-base-content/80">
                <li>
                  Contact us at{' '}
                  <a href="mailto:support@elidepro.com" className="link link-primary">
                    support@elidepro.com
                  </a>
                </li>
                <li>Provide a reason for the refund request along with any necessary supporting information.</li>
                <li>Our team will review and respond within 24 hours.</li>
              </ol>
            </div>
          </div>

          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title flex items-center gap-3">
                <div className="avatar avatar-placeholder">
                  <div className="bg-primary text-primary-content rounded-full w-8">
                    <span>5</span>
                  </div>
                </div>
                Contact Us
              </h2>
              <div className="mt-4 p-4 bg-base-300 rounded-lg">
                <p className="mb-2">
                  <span className="opacity-70">📧</span>{' '}
                  <a href="mailto:support@elidepro.com" className="link link-primary">
                    support@elidepro.com
                  </a>
                </p>
                <p>
                  <span className="opacity-70">📞</span>{' '}
                  <a href="tel:+919848000149" className="link link-primary">
                    9848000149
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RefundPolicy;