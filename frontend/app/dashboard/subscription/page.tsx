"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import useSubscription from "../../hooks/useSubscription";
const SubscriptionPage = () => {
  const { subscription, plans, loading, error, changePlan, addMinutes } =
    useSubscription();

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [minutes, setMinutes] = useState<number>(10);
  const [changeStatus, setChangeStatus] = useState({
    message: "",
    success: null as boolean | null,
  });
  const [addStatus, setAddStatus] = useState({
    message: "",
    success: null as boolean | null,
  });

  const router = useRouter();

  // Handle plan change
  const handlePlanChange = async () => {
    if (!selectedPlan) {
      setChangeStatus({ message: "Please select a plan", success: false });
      return;
    }

    const result = await changePlan(selectedPlan, billingCycle);
    setChangeStatus({
      message: result.message,
      success: result.success,
    });

    if (result.success) {
      // Reset selected plan after successful change
      setSelectedPlan(null);
    }
  };

  // Handle adding minutes
  const handleAddMinutes = async () => {
    if (!minutes || minutes <= 0) {
      setAddStatus({
        message: "Please enter a valid number of minutes",
        success: false,
      });
      return;
    }

    const result = await addMinutes(minutes);
    setAddStatus({
      message: result.message,
      success: result.success,
    });

    if (result.success) {
      // Reset minutes after successful addition
      setMinutes(10);
    }
  };

  // Helper function to calculate cost for add-on minutes
  const calculateAddOnCost = () => {
    if (!subscription || !minutes) return 0;
    const currentPlan = plans.find((p) => p._id === subscription.planId);
    if (!currentPlan) return 0;
    return (currentPlan.costPerAddOnMinute * minutes).toFixed(2);
  };

  // Show loading state
  if (loading && !subscription) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // Show error state
  if (error && !subscription) {
    return (
      <div className="alert alert-error">
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current flex-shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Error: {error}</span>
        </div>
      </div>
    );
  }

  // Finding current plan details
  const currentPlan =
    subscription && plans.length > 0
      ? plans.find((p) => p._id === subscription.planId)
      : null;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Your Subscription</h1>

      {/* Current Subscription Details */}
      {subscription && currentPlan && (
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title text-xl">
              Current Plan: {currentPlan.name}
            </h2>
            <div className="divider"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">Billing Cycle:</p>
                <p className="capitalize">{subscription.billingCycle}</p>

                <p className="font-semibold mt-4">Price:</p>
                <p>
                  $
                  {subscription.billingCycle === "monthly"
                    ? currentPlan.monthlyPrice.toFixed(2)
                    : currentPlan.yearlyPrice.toFixed(2)}{" "}
                  / {subscription.billingCycle === "monthly" ? "month" : "year"}
                </p>

                <p className="font-semibold mt-4">Minutes Included:</p>
                <p>{currentPlan.minutesIncluded} minutes</p>

                <p className="font-semibold mt-4">Additional Minutes:</p>
                <p>{subscription.additionalMinutes || 0} minutes</p>
              </div>

              <div>
                <p className="font-semibold">Features:</p>
                <ul className="list-disc ml-5">
                  {currentPlan.features
                    .filter((f) =>
                      subscription.billingCycle === "monthly"
                        ? f.monthly
                        : f.yearly
                    )
                    .map((feature, idx) => (
                      <li key={idx}>{feature.title}</li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Plan Section */}
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <h2 className="card-title text-xl">Upgrade Your Plan</h2>
          <div className="divider"></div>

          {/* Billing Cycle Toggle */}
          <div className="form-control w-full max-w-xs mb-4">
            <label className="label">
              <span className="label-text">Billing Cycle</span>
            </label>
            <div className="join">
              <button
                className={`join-item btn ${
                  billingCycle === "monthly" ? "btn-primary" : "btn-outline"
                }`}
                onClick={() => setBillingCycle("monthly")}
              >
                Monthly
              </button>
              <button
                className={`join-item btn ${
                  billingCycle === "yearly" ? "btn-primary" : "btn-outline"
                }`}
                onClick={() => setBillingCycle("yearly")}
              >
                Yearly (Save 20%)
              </button>
            </div>
          </div>

          {/* Plan Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {plans.map((plan) => (
              <div
                key={plan._id}
                className={`card cursor-pointer transition-all hover:shadow-lg ${
                  selectedPlan === plan._id
                    ? "border-2 border-primary"
                    : "border border-base-300"
                }`}
                onClick={() => setSelectedPlan(plan._id)}
              >
                <div className="card-body p-4">
                  <h3 className="card-title">{plan.name}</h3>
                  <p className="text-lg font-bold">
                    $
                    {billingCycle === "monthly"
                      ? plan.monthlyPrice.toFixed(2) + "/mo"
                      : plan.yearlyPrice.toFixed(2) + "/yr"}
                  </p>
                  <p className="text-sm">
                    {plan.minutesIncluded} minutes included
                  </p>
                  <div className="divider my-2"></div>
                  <ul className="space-y-1">
                    {plan.features
                      .filter((f) =>
                        billingCycle === "monthly" ? f.monthly : f.yearly
                      )
                      .map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-success"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          {feature.title}
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Plan change status message */}
          {changeStatus.message && (
            <div
              className={`alert ${
                changeStatus.success ? "alert-success" : "alert-error"
              } mb-4`}
            >
              <div>
                {changeStatus.success ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current flex-shrink-0 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current flex-shrink-0 h-6 w-6"
                    fill="none"
                    viewBox="0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
                <span>{changeStatus.message}</span>
              </div>
            </div>
          )}

          {/* Change Plan Button */}
          <div className="card-actions justify-end">
            <button
              className="btn btn-primary"
              onClick={handlePlanChange}
              disabled={!selectedPlan || subscription?.planId === selectedPlan}
            >
              {subscription?.planId === selectedPlan
                ? "Current Plan"
                : "Change Plan"}
            </button>
          </div>
        </div>
      </div>

      {/* Add-On Minutes Section */}
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <h2 className="card-title text-xl">Purchase Add-On Minutes</h2>
          <div className="divider"></div>

          <div className="flex flex-col md:flex-row gap-4 md:items-end">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Number of Minutes</span>
              </label>
              <input
                type="number"
                className="input input-bordered"
                value={minutes}
                onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
                min="1"
              />
            </div>

            {subscription && currentPlan && (
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-title">Cost per Minute</div>
                  <div className="stat-value text-lg">
                    ${currentPlan.costPerAddOnMinute.toFixed(2)}
                  </div>
                </div>
                <div className="stat">
                  <div className="stat-title">Total Cost</div>
                  <div className="stat-value text-lg">
                    ${calculateAddOnCost()}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Add minutes status message */}
          {addStatus.message && (
            <div
              className={`alert ${
                addStatus.success ? "alert-success" : "alert-error"
              } mt-4`}
            >
              <div>
                {addStatus.success ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current flex-shrink-0 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current flex-shrink-0 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
                <span>{addStatus.message}</span>
              </div>
            </div>
          )}

          {/* Add Minutes Button */}
          <div className="card-actions justify-end mt-4">
            <button
              className="btn btn-primary"
              onClick={handleAddMinutes}
              disabled={!minutes || minutes <= 0}
            >
              Purchase Minutes
            </button>
          </div>
        </div>
      </div>

      {/* Purchase History */}
      {subscription?.addOnPurchases && subscription.addOnPurchases.length > 0 && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-xl">Purchase History</h2>
            <div className="divider"></div>

            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Minutes</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {subscription.addOnPurchases.map((purchase, idx) => (
                    <tr key={idx}>
                      <td>
                        {new Date(purchase.purchaseDate).toLocaleDateString()}
                      </td>
                      <td>{purchase.minutes}</td>
                      <td>${purchase.price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;
