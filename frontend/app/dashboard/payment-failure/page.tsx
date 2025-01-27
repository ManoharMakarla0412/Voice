"use client"; // Required for client-side interactivity in Next.js 14

const PaymentFailure = () => {
  return (
    <div className="min-h-screen bg-[#1C1C1C] rounded-md text-gray-300 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Payment Failed!</h1>
        <p className="text-gray-600 mb-8">
          Unfortunately, your payment could not be processed. Please try again.
        </p>
        <div className="flex justify-center">
          <svg
            className="w-16 h-16 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </div>
        <button
          onClick={() => window.location.href = "/dashboard/payment"}
          className="mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default PaymentFailure;