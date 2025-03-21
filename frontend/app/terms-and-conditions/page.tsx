import Link from "next/link" 
import Header from "../utils/Header"
import Footer from "../utils/Footer"

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 to-black">
      {/* Header */}
     
<Header/>
      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-6xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block p-1 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 mb-6">
              <div className="bg-black px-4 py-1 rounded-md">
                <span className="text-gray-300 text-sm">Last Updated: January 08, 2025</span>
              </div>
            </div>
            <h1 className="text-5xl font-bold text-white mb-6 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Terms and Conditions
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
              Welcome to Elide Pro! These Terms and Conditions outline the rules and regulations for the use of our
              website and services. By accessing or using Elide Pro, you agree to comply with these terms.
            </p>
          </div>

          <div className="space-y-12 text-gray-300">
            <section className="bg-gray-800/20 rounded-2xl p-8 backdrop-blur-sm border border-gray-800 hover:border-gray-700 transition-colors">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 mr-3 text-sm">
                  1
                </span>
                Acceptance of Terms
              </h2>
              <p className="text-gray-300 leading-relaxed">
                By using our website and services, you confirm that you are at least 18 years old and have the legal
                capacity to enter into these Terms and Conditions. If you are using the services on behalf of a company
                or organization, you represent that you have the authority to bind that entity to these terms.
              </p>
            </section>

            <section className="bg-gray-800/20 rounded-2xl p-8 backdrop-blur-sm border border-gray-800 hover:border-gray-700 transition-colors">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 mr-3 text-sm">
                  2
                </span>
                Services Provided
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Elide Pro offers automated sales call management solutions designed to streamline the discovery phase of
                sales calls. Our services include but are not limited to lead qualification, call automation, and
                integration with customer relationship management (CRM) systems.
              </p>
            </section>

            <section className="bg-gray-800/20 rounded-2xl p-8 backdrop-blur-sm border border-gray-800 hover:border-gray-700 transition-colors">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 mr-3 text-sm">
                  3
                </span>
                User Accounts
              </h2>
              <p className="text-gray-300 leading-relaxed">
                To access certain features of our services, you may need to create an account. You are responsible for
                maintaining the confidentiality of your account information and for all activities that occur under your
                account. You agree to notify us immediately of any unauthorized use of your account.
              </p>
            </section>

            <section className="bg-gray-800/20 rounded-2xl p-8 backdrop-blur-sm border border-gray-800 hover:border-gray-700 transition-colors">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 mr-3 text-sm">
                  4
                </span>
                Payment Terms
              </h2>
              <p className="text-gray-300 leading-relaxed">
                By subscribing to our services, you agree to pay all fees associated with your chosen plan. Payment is
                due upon subscription and will be billed monthly or annually as specified during the signup process. We
                reserve the right to change our pricing at any time; however, existing subscribers will be notified
                prior to any changes.
              </p>
            </section>

            <section className="bg-gray-800/20 rounded-2xl p-8 backdrop-blur-sm border border-gray-800 hover:border-gray-700 transition-colors">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 mr-3 text-sm">
                  5
                </span>
                Cancellation and Refund Policy
              </h2>
              <p className="text-gray-300 leading-relaxed">
                You may cancel your subscription at any time through your account settings. Refunds will be provided
                according to our refund policy, which is available on our website.
              </p>
            </section>

            <section className="bg-gray-800/20 rounded-2xl p-8 backdrop-blur-sm border border-gray-800 hover:border-gray-700 transition-colors">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 mr-3 text-sm">
                  6
                </span>
                User Conduct
              </h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                You agree not to use our services for any unlawful purpose or in a manner that could damage, disable,
                overburden, or impair the website or interfere with any other party's use of the services. Prohibited
                activities include but are not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-300">
                <li>Sending unsolicited communications (spam)</li>
                <li>Impersonating any person or entity</li>
                <li>Transmitting harmful or malicious code</li>
              </ul>
            </section>

            <section className="bg-gray-800/20 rounded-2xl p-8 backdrop-blur-sm border border-gray-800 hover:border-gray-700 transition-colors">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 mr-3 text-sm">
                  7
                </span>
                Intellectual Property
              </h2>
              <p className="text-gray-300 leading-relaxed">
                All content on Elide Pro, including text, graphics, logos, and software, is the property of Elide Pro or
                its licensors and is protected by copyright and intellectual property laws. You may not reproduce,
                distribute, or create derivative works from any content without our express written consent.
              </p>
            </section>

            <section className="bg-gray-800/20 rounded-2xl p-8 backdrop-blur-sm border border-gray-800 hover:border-gray-700 transition-colors">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 mr-3 text-sm">
                  8
                </span>
                Limitation of Liability
              </h2>
              <p className="text-gray-300 leading-relaxed">
                To the fullest extent permitted by law, Elide Pro shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages arising from your use of our services or inability to access
                them.
              </p>
            </section>

            <section className="bg-gray-800/20 rounded-2xl p-8 backdrop-blur-sm border border-gray-800 hover:border-gray-700 transition-colors">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 mr-3 text-sm">
                  9
                </span>
                Indemnification
              </h2>
              <p className="text-gray-300 leading-relaxed">
                You agree to indemnify and hold harmless Elide Pro and its affiliates from any claims, losses,
                liabilities, damages, costs, or expenses (including reasonable attorneys' fees) arising out of your use
                of our services or violation of these Terms and Conditions.
              </p>
            </section>

            <section className="bg-gray-800/20 rounded-2xl p-8 backdrop-blur-sm border border-gray-800 hover:border-gray-700 transition-colors">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 mr-3 text-sm">
                  10
                </span>
                Changes to Terms
              </h2>
              <p className="text-gray-300 leading-relaxed">
                We reserve the right to modify these Terms and Conditions at any time. We will notify you of significant
                changes via email or through a notice on our website. Your continued use of our services after such
                changes constitutes your acceptance of the new terms.
              </p>
            </section>

            <section className="bg-gray-800/20 rounded-2xl p-8 backdrop-blur-sm border border-gray-800 hover:border-gray-700 transition-colors">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 mr-3 text-sm">
                  11
                </span>
                Governing Law
              </h2>
              <p className="text-gray-300 leading-relaxed">
                These Terms and Conditions shall be governed by and construed in accordance with the laws of Hyderabad,
                Telangana. Any disputes arising out of or related to these terms shall be resolved in the courts located
                in Hyderabad.
              </p>
            </section>

            <section className="bg-gray-800/20 rounded-2xl p-8 backdrop-blur-sm border border-gray-800 hover:border-gray-700 transition-colors">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 mr-3 text-sm">
                  12
                </span>
                Contact Information
              </h2>
              <p className="text-gray-300 leading-relaxed">
                If you have any questions about these Terms and Conditions, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                <p className="text-gray-300">
                  <strong className="text-white">Email:</strong>{" "}
                  <a href="mailto:support@elidepro.com" className="text-blue-400 hover:text-blue-300 transition-colors">
                    support@elidepro.com
                  </a>
                </p>
                <p className="text-gray-300 mt-2">
                  <strong className="text-white">Address:</strong> 7th Floor, Asian Suncity, Kothaguda, Kondapur,
                  Hyderabad – 500084
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
     <Footer/>
    </div>
  )
}

