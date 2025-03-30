"use client";
import { useState, useEffect } from "react";
import { BASE_URL } from "../../utils/constants";
import {
  CreditCard,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  X,
  Calendar,
  Shield,
  RefreshCw,
} from "lucide-react";

interface UserPlan {
  plan?: string;
  billing?: string;
  billingCycleDays?: number;
  nextBillingDate?: string;
}

const planOptions = {
  basic: {
    name: "Basic",
    description: "Perfect for small teams and startups",
    monthlyPrice: 10000,
    yearlyPrice: 110000,
    features: [
      "1 Voice Assistant",
      "500 Minutes per Month",
      "Basic Call Analytics",
    ],
  },
  pro: {
    name: "Pro",
    description: "For growing businesses with more needs",
    monthlyPrice: 17000,
    yearlyPrice: 170000,
    features: [
      "3 Voice Assistants",
      "1000 Minutes per Month",
      "Email & Chat Support",
      "Advanced Call Analytics",
    ],
  },
  enterprise: {
    name: "Enterprise",
    description: "For large organizations with custom needs",
    monthlyPrice: 30000,
    yearlyPrice: 280000,
    features: [
      "10 Voice Assistants",
      "2000 Minutes per Month",
      "24/7 Phone Support",
      "Enterprise Analytics & Dedicated Account Manager",
    ],
  },
};

const Checkout = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<UserPlan>({});
  const [loading, setLoading] = useState(true);

  // Fetch user's current plan
  useEffect(() => {
    const fetchUserPlan = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/user/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("auth_token")}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch user data");

        const data = await response.json();
        setUserPlan({
          plan: data.data.user.plan,
          billing: data.data.user.billing,
          billingCycleDays: data.data.user.billingCycleDays,
          // Calculate next billing date based on registration date + billing cycle
          nextBillingDate: calculateNextBillingDate(
            data.data.user.registrationDate,
            data.data.user.billingCycleDays
          ),
        });
      } catch (err) {
        setError(
          "Failed to load your plan information. Please try again later."
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPlan();
  }, []);

  // Calculate next billing date
  const calculateNextBillingDate = (
    registrationDate: string,
    billingCycleDays: number
  ) => {
    const regDate = new Date(registrationDate);
    const nextDate = new Date(regDate);
    nextDate.setDate(regDate.getDate() + billingCycleDays);

    return nextDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Process payment and redirect to payment gateway
  const handlePayment = async () => {
    if (!userPlan.plan) {
      setError("Unable to process payment. No plan selected.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    // Get the price based on plan and billing cycle
    const planPrice = getPlanPrice(
      userPlan.plan,
      userPlan.billing || "monthly"
    );

    const data = {
      planId: userPlan.plan,
      billingCycle: userPlan.billing,
      amount: planPrice,
    };

    try {
      const response = await fetch(`${BASE_URL}/api/payment/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("auth_token")}`,
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
      setError("Payment processing failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper function to get plan price
  const getPlanPrice = (planId: string, cycle: string | undefined) => {
    if (!planId || !planOptions[planId as keyof typeof planOptions]) return 0;

    const plan = planOptions[planId as keyof typeof planOptions];
    return cycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
  };

  // Get formatted price
  const getFormattedPrice = (planId: string, cycle: string | undefined) => {
    const price = getPlanPrice(planId, cycle);
    return `₹${price }.00`;
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header with title */}
        <div className="card bg-base-300/80 border-2 border-primary/30 shadow-lg">
          <div className="card-body">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary/20 text-primary-content rounded-full w-16 h-16 flex items-center justify-center">
                  <CreditCard className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold flex items-center gap-2">
                    Subscription Payment
                  </h1>
                  <p className="text-base-content/70 mt-1">
                    Complete your payment to continue with your subscription
                  </p>
                </div>
              </div>

              {!loading && userPlan.plan && (
                <div className="stats bg-base-200/60 shadow-md border border-base-200/30">
                  <div className="stat">
                    <div className="stat-title">Current Plan</div>
                    <div className="stat-value text-primary">
                      {userPlan.plan?.charAt(0).toUpperCase() +
                        userPlan.plan?.slice(1) || "Free"}
                    </div>
                    <div className="stat-desc">
                      {userPlan.billing || "N/A"} billing
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="alert alert-error shadow-lg border border-error/30">
            <AlertTriangle size={18} />
            <div>
              <h3 className="font-bold">Error</h3>
              <div className="text-sm">{error}</div>
            </div>
            <button
              className="btn btn-sm btn-circle btn-ghost ml-auto"
              onClick={() => setError(null)}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="mt-4 text-base-content/70">
              Loading subscription data...
            </p>
          </div>
        ) : (
          <>
            {/* Current Plan Info */}
            {userPlan.plan && (
              <div className="card bg-base-300/80 border-2 border-primary/30 shadow-lg">
                <div className="card-body">
                  <h2 className="card-title flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Current Subscription
                  </h2>

                  <div className="divider"></div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-base-200/40 p-4 rounded-lg">
                      <div className="text-base-content/80 text-sm">Plan</div>
                      <div className="text-xl font-bold mt-1 flex items-center gap-2">
                        <span className="badge badge-primary badge-outline">
                          {userPlan.plan?.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="bg-base-200/40 p-4 rounded-lg">
                      <div className="text-base-content/80 text-sm">
                        Billing Cycle
                      </div>
                      <div className="text-xl font-bold mt-1 flex items-center gap-2">
                        {userPlan.billing === "monthly" ? (
                          <span>Monthly Payment</span>
                        ) : (
                          <span>Annual Payment</span>
                        )}
                      </div>
                    </div>

                    <div className="bg-base-200/40 p-4 rounded-lg">
                      <div className="text-base-content/80 text-sm">
                        Next Payment
                      </div>
                      <div className="text-xl font-bold mt-1 flex items-center gap-2">
                        <Calendar size={16} className="text-primary" />
                        {userPlan.nextBillingDate}
                      </div>
                    </div>
                  </div>

                  <div className="alert bg-info/10 border-info/30 mt-4">
                    <RefreshCw className="h-5 w-5 text-info" />
                    <span>
                      You're renewing your {userPlan.plan?.toUpperCase()} plan.
                      After payment, your subscription will be extended
                      according to your billing cycle.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Order Summary */}
            {userPlan.plan && (
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
                          <td className="font-medium">
                            {userPlan.plan?.charAt(0).toUpperCase() +
                              userPlan.plan?.slice(1)}{" "}
                            Plan
                          </td>
                          <td>
                            {userPlan.billing === "monthly"
                              ? "Monthly"
                              : "Annual"}{" "}
                            subscription
                          </td>
                          <td className="text-right">
                            {getFormattedPrice(
                              userPlan.plan || "",
                              userPlan.billing
                            )}
                          </td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr>
                          <th colSpan={2} className="text-right">
                            Total:
                          </th>
                          <th className="text-right">
                            {getFormattedPrice(
                              userPlan.plan || "",
                              userPlan.billing
                            )}
                          </th>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div className="bg-base-200/40 p-4 rounded-lg mt-4">
                    <h3 className="font-bold flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      Your Plan Features:
                    </h3>
                    <ul className="space-y-2">
                      {userPlan.plan &&
                        planOptions[
                          userPlan.plan as keyof typeof planOptions
                        ]?.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-success mt-1" />
                            <span>{feature}</span>
                          </li>
                        ))}
                    </ul>
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
                          Complete Payment <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-sm text-center text-base-content/70 mt-4">
                    By proceeding, you agree to our{" "}
                    <a href="#" className="link link-primary">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="link link-primary">
                      Privacy Policy
                    </a>
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Checkout;
