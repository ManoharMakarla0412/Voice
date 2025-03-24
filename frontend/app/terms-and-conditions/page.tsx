import Link from "next/link";

export default function TermsAndConditions() {
  const sections = [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      content:
        "By using our website and services, you confirm that you are at least 18 years old and have the legal capacity to enter into these Terms and Conditions. If you are using the services on behalf of a company or organization, you represent that you have the authority to bind that entity to these terms.",
    },
    {
      id: "services",
      title: "Services Provided",
      content:
        "Elide Pro offers automated sales call management solutions designed to streamline the discovery phase of sales calls. Our services include but are not limited to lead qualification, call automation, and integration with customer relationship management (CRM) systems.",
    },
    {
      id: "accounts",
      title: "User Accounts",
      content:
        "To access certain features of our services, you may need to create an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.",
    },
    {
      id: "payment",
      title: "Payment Terms",
      content:
        "By subscribing to our services, you agree to pay all fees associated with your chosen plan. Payment is due upon subscription and will be billed monthly or annually as specified during the signup process. We reserve the right to change our pricing at any time; however, existing subscribers will be notified prior to any changes.",
    },
    {
      id: "cancellation",
      title: "Cancellation and Refund Policy",
      content:
        "You may cancel your subscription at any time through your account settings. Refunds will be provided according to our refund policy, which is available on our website.",
      link: {
        text: "View our Refund Policy",
        href: "/refund-policy",
      },
    },
    {
      id: "conduct",
      title: "User Conduct",
      content:
        "You agree not to use our services for any unlawful purpose or in a manner that could damage, disable, overburden, or impair the website or interfere with any other party's use of the services. Prohibited activities include but are not limited to:",
      list: [
        "Sending unsolicited communications (spam)",
        "Impersonating any person or entity",
        "Transmitting harmful or malicious code",
      ],
    },
    {
      id: "intellectual",
      title: "Intellectual Property",
      content:
        "All content on Elide Pro, including text, graphics, logos, and software, is the property of Elide Pro or its licensors and is protected by copyright and intellectual property laws. You may not reproduce, distribute, or create derivative works from any content without our express written consent.",
    },
    {
      id: "liability",
      title: "Limitation of Liability",
      content:
        "To the fullest extent permitted by law, Elide Pro shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services or inability to access them.",
    },
    {
      id: "indemnification",
      title: "Indemnification",
      content:
        "You agree to indemnify and hold harmless Elide Pro and its affiliates from any claims, losses, liabilities, damages, costs, or expenses (including reasonable attorneys' fees) arising out of your use of our services or violation of these Terms and Conditions.",
    },
    {
      id: "changes",
      title: "Changes to Terms",
      content:
        "We reserve the right to modify these Terms and Conditions at any time. We will notify you of significant changes via email or through a notice on our website. Your continued use of our services after such changes constitutes your acceptance of the new terms.",
    },
    {
      id: "governing",
      title: "Governing Law",
      content:
        "These Terms and Conditions shall be governed by and construed in accordance with the laws of Hyderabad, Telangana. Any disputes arising out of or related to these terms shall be resolved in the courts located in Hyderabad.",
    },
    {
      id: "contact",
      title: "Contact Information",
      content:
        "If you have any questions about these Terms and Conditions, please contact us at:",
      contact: {
        email: "support@elidepro.com",
        address:
          "7th Floor, Asian Suncity, Kothaguda, Kondapur, Hyderabad – 500084",
      },
    },
  ];

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="bg-base-200 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-4">Terms and Conditions</h1>
          <p className="text-base-content/80 max-w-3xl">
            Welcome to Elide Pro! These Terms and Conditions outline the rules
            and regulations for the use of our website and services. By
            accessing or using Elide Pro, you agree to comply with these terms.
          </p>
          <div className="badge badge-primary mt-4">
            Last Updated: January 08, 2025
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {sections.map((section) => (
            <div
              key={section.id}
              id={section.id}
              className="card bg-base-200 shadow-md"
            >
              <div className="card-body">
                <h2 className="card-title text-xl">{section.title}</h2>
                <p className="text-base-content/80 mt-2">{section.content}</p>

                {section.list && (
                  <ul className="list-disc pl-5 mt-3 space-y-1">
                    {section.list.map((item, i) => (
                      <li key={i} className="text-base-content/80">
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                {section.link && (
                  <div className="mt-4">
                    <Link
                      href={section.link.href}
                      className="link link-primary"
                    >
                      {section.link.text}
                    </Link>
                  </div>
                )}

                {section.contact && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="w-4 h-4 text-primary"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="font-medium">Email:</span>
                      <a
                        href={`mailto:${section.contact.email}`}
                        className="link link-primary"
                      >
                        {section.contact.email}
                      </a>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="w-4 h-4 mt-1 text-primary"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="font-medium">Address:</span>
                      <span>{section.contact.address}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

     

      
    </div>
  );
}
