"use client"; // Required for client-side interactivity in Next.js 14

const PaymentSuccess = () => {
  return (
    <div className="min-h-screen bg-[#1C1C1C] rounded-md text-gray-300 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Payment Successful!</h1>
        <p className="text-gray-600 mb-8">
          Thank you for your payment. Your transaction was completed successfully.
        </p>
        <div className="flex justify-center">
          <svg
            className="w-16 h-16 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        </div>
        <button
          onClick={() => window.location.href = "/dashboard"}
          className="mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;