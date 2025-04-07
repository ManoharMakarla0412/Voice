"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BASE_URL } from "../../utils/constants";
import {
  CreditCard,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  X,
} from "lucide-react";

const planOptions = {
  basic: { name: "Basic", monthlyPrice: 10000, yearlyPrice: 110000 },
  pro: { name: "Pro", monthlyPrice: 17000, yearlyPrice: 170000 },
  enterprise: { name: "Enterprise", monthlyPrice: 30000, yearlyPrice: 280000 },
};

const Checkout = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planData, setPlanData] = useState<{ plan: string; billing: "monthly" | "yearly"; username: string; email: string; password: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const signupData = sessionStorage.getItem("signupData");
    if (signupData) {
      setPlanData(JSON.parse(signupData));
    } else {
      setError("No plan selected. Please go back and select a plan.");
    }
  }, []);

  const handlePayment = async () => {
    if (!planData) {
      setError("No plan data available.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    const planPrice = planOptions[planData.plan as keyof typeof planOptions][
      planData.billing === "monthly" ? "monthlyPrice" : "yearlyPrice"
    ];

    const paymentData = {
      planId: planData.plan,
      billingCycle: planData.billing,
      amount: planPrice,
      redirectUrl: `${window.location.origin}/checkout/callback`, // Callback URL
    };

    try {
      const response = await fetch(`${BASE_URL}/api/payment/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) throw new Error("Failed to create payment order");

      const result = await response.json();
      window.location.href = result.url; // Redirect to PhonePe
    } catch (err) {
      setError("Payment initiation failed. Please try again.");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle PhonePe callback (called after payment)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get("status");

    if (paymentStatus === "success" && planData) {
      handleSignupAfterPayment();
    } else if (paymentStatus === "failure") {
      setError("Payment failed. Please try again.");
    }
  }, [planData]);

  const handleSignupAfterPayment = async () => {
    if (!planData) return;

    setIsProcessing(true);
    try {
      const signupResponse = await fetch(`${BASE_URL}/user/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: planData.username,
          email: planData.email,
          password: planData.password,
          plan: planData.plan,
          billing: planData.billing,
        }),
      });

      if (!signupResponse.ok) throw new Error("Signup failed after payment");

      const signupResult = await signupResponse.json();
      if (signupResult.status === "success" && signupResult.data.token) {
        sessionStorage.setItem("auth_token", signupResult.data.token);
        sessionStorage.setItem("username", signupResult.data.user.username);
        sessionStorage.setItem("email", signupResult.data.user.email);
        sessionStorage.removeItem("signupData"); // Cleanup
        router.push("/login");
      } else {
        setError("Unexpected signup response");
      }
    } catch (err) {
      setError("Signup failed after payment. Contact support.");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const getFormattedPrice = () => {
    if (!planData) return "₹0.00";
    const price = planOptions[planData.plan as keyof typeof planOptions][
      planData.billing === "monthly" ? "monthlyPrice" : "yearlyPrice"
    ];
    return `₹${price}.00`;
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="card bg-base-300/80 border-2 border-primary/30 shadow-lg">
          <div className="card-body">
            <div className="flex items-center gap-4">
              <div className="bg-primary/20 text-primary-content rounded-full w-16 h-16 flex items-center justify-center">
                <CreditCard className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Complete Your Payment</h1>
                <p className="text-base-content/70 mt-1">Proceed to activate your subscription</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-error shadow-lg border border-error/30">
            <AlertTriangle size={18} />
            <div>
              <h3 className="font-bold">Error</h3>
              <div className="text-sm">{error}</div>
            </div>
            <button className="btn btn-sm btn-circle btn-ghost ml-auto" onClick={() => setError(null)}>
              <X size={16} />
            </button>
          </div>
        )}

        {planData ? (
          <div className="card bg-base-300/80 border-2 border-primary/30 shadow-lg">
            <div className="card-body">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Order Summary
              </h2>
              <div className="divider"></div>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Plan</th>
                      <th>Billing Cycle</th>
                      <th className="text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="font-medium">{planOptions[planData.plan as keyof typeof planOptions].name} Plan</td>
                      <td>{planData.billing === "monthly" ? "Monthly" : "Annual"} subscription</td>
                      <td className="text-right">{getFormattedPrice()}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <th colSpan={2} className="text-right">Total:</th>
                      <th className="text-right">{getFormattedPrice()}</th>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="btn btn-primary btn-lg gap-2"
                >
                  {isProcessing ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      Pay Now <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
              <p className="text-sm text-center text-base-content/70 mt-4">
                By proceeding, you agree to our{" "}
                <a href="#" className="link link-primary">Terms of Service</a> and{" "}
                <a href="#" className="link link-primary">Privacy Policy</a>
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-base-content/70">Loading payment details...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;