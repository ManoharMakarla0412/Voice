"use client";
import { BASE_URL } from "../../utils/constants";

 // Required for client-side interactivity in Next.js 14

const Checkout = () => {
  const handlePayment = async () => {
    const data = {
      name: "John Doe",
      mobileNumber: 1234567890,
      amount: 1,
    };

    try {
      const response = await fetch(`${BASE_URL}/api/payment/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create payment order");
      }

      const result = await response.json();
      console.log(result);

      // Redirect to the payment URL
      window.location.href = result.url;
    } catch (error) {
      console.error("Error in payment:", error);
      alert("Payment failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#1C1C1C] rounded-md text-gray-300 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Checkout</h1>
        <p className="text-gray-600 mb-8">Complete your payment securely.</p>
        <button
          onClick={handlePayment}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105"
        >
          Pay Now
        </button>
      </div>
    </div>
  );
};

export default Checkout;