"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSubscription, { ChangeType } from "../../hooks/useSubscription";

const SubscriptionPage = () => {
  const {
    subscription,
    plans,
    loading,
    error,
    changePlan,
    addMinutes,
    cancelSubscription,
    consumedMinutes,
    availableMinutes,
    totalMinutes,
    totalCost,
    subscriptionHistory,
  } = useSubscription();

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [changeType, setChangeType] = useState<ChangeType>("immediate");
  const [minutes, setMinutes] = useState<number>(10);
  const [changeStatus, setChangeStatus] = useState({
    message: "",
    success: null as boolean | null,
    proration: null as any,
  });
  const [addStatus, setAddStatus] = useState({
    message: "",
    success: null as boolean | null,
  });
  const [cancelStatus, setCancelStatus] = useState({
    message: "",
    success: null as boolean | null,
  });
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelType, setCancelType] = useState<"immediate" | "end_of_period">(
    "end_of_period"
  );

  const router = useRouter();

  // Set the current plan as selected when subscription data loads
  useEffect(() => {
    if (subscription && subscription.planId) {
      setSelectedPlan(subscription.planId);
      setBillingCycle(subscription.billingCycle as "monthly" | "yearly");
    }
  }, [subscription]);

  const handlePlanChange = async () => {
    if (!selectedPlan) {
      setChangeStatus({
        message: "Please select a plan",
        success: false,
        proration: null,
      });
      return;
    }

    // Don't process if selecting the current plan with the same billing cycle
    if (
      subscription?.planId === selectedPlan &&
      subscription?.billingCycle === billingCycle
    ) {
      setChangeStatus({
        message: "You are already on this plan",
        success: false,
        proration: null,
      });
      return;
    }

    const result = await changePlan(selectedPlan, billingCycle, changeType);
    setChangeStatus({
      message: result.message,
      success: result.success,
      proration: result.proration || null,
    });

    if (result.success) {
      // Leave selectedPlan as is after successful change
    }
  };

  const handleCancelSubscription = async () => {
    const result = await cancelSubscription(cancelType);
    setCancelStatus({ message: result.message, success: result.success });

    if (result.success) {
      setShowCancelModal(false);
    }
  };

  const handleAddMinutes = async () => {
    if (!minutes || minutes <= 0) {
      setAddStatus({
        message: "Please enter a valid number of minutes",
        success: false,
      });
      return;
    }

    const result = await addMinutes(minutes);
    setAddStatus({ message: result.message, success: result.success });

    if (result.success) {
      setMinutes(10);
    }
  };

  const calculateAddOnCost = () => {
    if (!subscription || !minutes) return 0;
    const currentPlan = plans.find((p) => p._id === subscription.planId);
    if (!currentPlan) return 0;
    return (currentPlan.costPerAddOnMinute * minutes).toFixed(2);
  };

  if (loading && !subscription) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="flex flex-col items-center gap-3">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-base-content/70">Loading subscription data...</p>
        </div>
      </div>
    );
  }

  if (error && !subscription) {
    return (
      <div className="min-h-screen flex justify-center items-center p-4">
        <div className="alert alert-error max-w-md border-2 border-error/30">
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
          <div>
            <h3 className="font-bold">Error</h3>
            <div className="text-sm">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  const currentPlan =
    subscription && plans.length > 0
      ? plans.find((p) => p._id === subscription.planId)
      : null;

  const selectedPlanDetails =
    selectedPlan && plans.length > 0
      ? plans.find((p) => p._id === selectedPlan)
      : null;

  const nextPlanDetails =
    subscription?.nextPlanId && plans.length > 0
      ? plans.find((p) => p._id === subscription.nextPlanId)
      : null;

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header with subscription info */}
        <div className="card bg-base-300/80 border-2 border-primary/30 shadow-lg">
          <div className="card-body">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div>
                <h1 className="text-2xl font-bold">Your Subscription</h1>
                <p className="text-base-content/70">
                  Manage your subscription plan and add-on minutes
                </p>
                {subscription?.status === "active" &&
                  subscription.cancelAtPeriodEnd && (
                    <div className="badge badge-warning gap-2 mt-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="inline-block w-4 h-4 stroke-current"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      Cancels at end of billing period
                    </div>
                  )}
              </div>

              {subscription && currentPlan && (
                <div className="stats bg-base-200/60 shadow-md border border-base-200/30">
                  <div className="stat">
                    <div className="stat-title">Current Plan</div>
                    <div className="stat-value text-lg text-primary uppercase">
                      {currentPlan.name}
                    </div>
                    <div className="stat-desc capitalize">
                      {subscription.billingCycle} billing
                    </div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Available Minutes</div>
                    <div className="stat-value text-lg">
                      {availableMinutes.toFixed(0)}
                    </div>
                    <div className="stat-desc">of {totalMinutes} total</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Current Plan Details */}
        {subscription && currentPlan && (
          <div className="card bg-base-300/80 border-2 border-primary/30 shadow-lg">
            <div className="card-body p-6">
              <div className="flex items-center gap-2 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-primary h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <h2 className="font-bold text-lg">Plan Details</h2>
              </div>
              <div className="divider my-2"></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="bg-base-200/60 rounded-lg p-4 border border-base-200/30">
                    <h3 className="font-semibold mb-2">Billing Information</h3>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-base-content/70">
                        Billing Cycle:
                      </span>
                      <span className="badge badge-primary badge-lg capitalize">
                        {subscription.billingCycle}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-base-content/70">
                        Next Billing:
                      </span>
                      <span>
                        {new Date(subscription.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-base-content/70">Plan Price:</span>
                      <span className="font-bold">
                        ₹
                        {subscription.billingCycle === "monthly"
                          ? currentPlan.monthlyPrice.toFixed(2)
                          : currentPlan.yearlyPrice.toFixed(2)}
                        /
                        {subscription.billingCycle === "monthly"
                          ? "month"
                          : "year"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base-content/70">Add-on Rate:</span>
                      <span>
                        ₹{currentPlan.costPerAddOnMinute.toFixed(2)}/minute
                      </span>
                    </div>
                  </div>

                  <div className="bg-base-200/60 rounded-lg p-4 border border-base-200/30">
                    <h3 className="font-semibold mb-2">Features</h3>
                    <ul className="space-y-2">
                      {currentPlan.features
                        .filter((f) =>
                          subscription.billingCycle === "monthly"
                            ? f.monthly
                            : f.yearly
                        )
                        .map((feature, idx) => (
                          <li key={idx} className="flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-success mr-2"
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

                  {/* Upcoming Plan Change Section */}
                  {subscription.nextPlanId && nextPlanDetails && (
                    <div className="bg-base-200/60 rounded-lg p-4 border-2 border-warning/30">
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          className="stroke-warning h-5 w-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <h3 className="font-semibold">Upcoming Plan Change</h3>
                      </div>
                      <div className="divider my-2"></div>

                      <p className="mb-2">
                        Your plan will change at next billing cycle:
                      </p>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-base-content/70">New Plan:</span>
                        <span className="font-medium uppercase">
                          {nextPlanDetails.name}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-base-content/70">
                          New Billing:
                        </span>
                        <span className="font-medium capitalize">
                          {subscription.nextBillingCycle}
                        </span>
                      </div>
                      <button
                        onClick={async () => {
                          if (confirm("Cancel your scheduled plan change?")) {
                            await changePlan(
                              subscription.planId,
                              subscription.billingCycle,
                              "next_cycle"
                            );
                          }
                        }}
                        className="btn btn-sm btn-outline btn-warning mt-3 w-full"
                      >
                        Cancel Change
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <div className="bg-base-200/60 rounded-lg p-4 border border-base-200/30">
                    <h3 className="font-semibold mb-4">Minutes Usage</h3>
                    <div className="stats stats-vertical shadow w-full">
                      <div className="stat">
                        <div className="stat-title">Included Minutes</div>
                        <div className="stat-value text-lg">
                          {currentPlan.minutesIncluded}
                        </div>
                      </div>

                      <div className="stat">
                        <div className="stat-title">Added Minutes</div>
                        <div className="stat-value text-lg">
                          {subscription.additionalMinutes || 0}
                        </div>
                      </div>

                      <div className="stat bg-primary bg-opacity-10">
                        <div className="stat-title">Total Minutes</div>
                        <div className="stat-value">{totalMinutes}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-base-200/60 rounded-lg p-4 border border-base-200/30 mt-6">
                    <h3 className="font-semibold mb-2">Usage</h3>
                    <div className="mb-2">
                      <div className="flex justify-between mb-1">
                        <span>Minutes Used</span>
                        <span>
                          {consumedMinutes.toFixed(0)} of {totalMinutes}
                        </span>
                      </div>
                      <progress
                        className="progress progress-primary w-full"
                        value={consumedMinutes}
                        max={totalMinutes}
                      ></progress>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-base-content/70">Total Cost:</span>
                      <span className="font-bold text-primary text-xl">
                        ₹{totalCost?.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="btn btn-outline btn-error"
                    >
                      Cancel Subscription
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upgrade Plan Section */}
        <div className="card bg-base-300/80 border-2 border-primary/30 shadow-lg">
          <div className="card-body p-6">
            <div className="flex items-center gap-2 mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-primary h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z"
                />
              </svg>
              <h2 className="font-bold text-lg">Upgrade Your Plan</h2>
            </div>
            <div className="divider my-2"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">
                      Billing Cycle
                    </span>
                  </label>
                  <div className="join w-full">
                    <button
                      className={`join-item btn flex-1 ${
                        billingCycle === "monthly"
                          ? "btn-primary"
                          : "btn-outline"
                      }`}
                      onClick={() => setBillingCycle("monthly")}
                    >
                      Monthly
                    </button>
                    <button
                      className={`join-item btn flex-1 ${
                        billingCycle === "yearly"
                          ? "btn-primary"
                          : "btn-outline"
                      }`}
                      onClick={() => setBillingCycle("yearly")}
                    >
                      Yearly{" "}
                      <span className="badge badge-sm ml-1">Save 20%</span>
                    </button>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Select Plan</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={selectedPlan || ""}
                    onChange={(e) => setSelectedPlan(e.target.value || null)}
                  >
                    <option value="" disabled>
                      Choose a plan
                    </option>
                    {plans.map((plan) => (
                      <option key={plan._id} value={plan._id}>
                        {plan.name.toUpperCase()}
                        {subscription?.planId === plan._id ? " (Current)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Change Type</span>
                  </label>
                  <div className="join w-full">
                    <button
                      className={`join-item btn flex-1 ${
                        changeType === "immediate"
                          ? "btn-primary"
                          : "btn-outline"
                      }`}
                      onClick={() => setChangeType("immediate")}
                    >
                      Immediate
                    </button>
                    <button
                      className={`join-item btn flex-1 ${
                        changeType === "next_cycle"
                          ? "btn-primary"
                          : "btn-outline"
                      }`}
                      onClick={() => setChangeType("next_cycle")}
                    >
                      Next Billing Cycle
                    </button>
                  </div>
                  <label className="label">
                    <span className="label-text-alt">
                      {changeType === "immediate"
                        ? "Changes apply now with prorated billing"
                        : "Changes apply when current billing period ends"}
                    </span>
                  </label>
                </div>

                {selectedPlanDetails && (
                  <div className="bg-base-200/60 rounded-lg p-5 border border-base-200/30 mt-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-bold text-lg uppercase">
                        {selectedPlanDetails.name}
                      </span>
                      <span className="badge badge-primary">
                        {selectedPlanDetails.minutesIncluded} minutes
                      </span>
                    </div>

                    <div className="flex justify-between mb-4">
                      <span className="text-base-content/70">Price:</span>
                      <span className="font-bold text-primary">
                        ₹
                        {billingCycle === "monthly"
                          ? selectedPlanDetails.monthlyPrice.toFixed(2) + "/mo"
                          : selectedPlanDetails.yearlyPrice.toFixed(2) + "/yr"}
                      </span>
                    </div>

                    <div className="divider my-2"></div>

                    <h4 className="font-semibold mb-2">Features:</h4>
                    <ul className="space-y-2">
                      {selectedPlanDetails.features
                        .filter((f) =>
                          billingCycle === "monthly" ? f.monthly : f.yearly
                        )
                        .map((feature, idx) => (
                          <li key={idx} className="flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-success mr-2"
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

                    <button
                      className={`btn w-full mt-6 ${
                        subscription?.planId === selectedPlan &&
                        subscription?.billingCycle === billingCycle
                          ? "btn-disabled"
                          : "btn-primary"
                      }`}
                      onClick={handlePlanChange}
                      disabled={
                        subscription?.planId === selectedPlan &&
                        subscription?.billingCycle === billingCycle
                      }
                    >
                      {subscription?.planId === selectedPlan &&
                      subscription?.billingCycle === billingCycle
                        ? "Current Plan"
                        : changeType === "immediate"
                        ? "Change Plan Now"
                        : "Change at Next Cycle"}
                    </button>
                  </div>
                )}
              </div>

              <div>
                {changeStatus.message && (
                  <div
                    className={`alert ${
                      changeStatus.success ? "alert-success" : "alert-error"
                    } shadow-lg mb-6`}
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
                      <span>{changeStatus.message}</span>
                    </div>
                  </div>
                )}

                {changeStatus.proration && changeType === "immediate" && (
                  <div className="bg-base-200/60 rounded-lg p-4 border-2 border-info/30 mb-6">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 stroke-info"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Prorated Billing Details
                    </h4>
                    <div className="divider my-1"></div>
                    <div className="flex justify-between mb-1">
                      <span className="text-base-content/70">
                        Days Left in Cycle:
                      </span>
                      <span>{changeStatus.proration.daysLeft} days</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-base-content/70">
                        Refund for Current Plan:
                      </span>
                      <span>
                        ₹{changeStatus.proration.proratedRefund.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-base-content/70">
                        Charge for New Plan:
                      </span>
                      <span>
                        ₹{changeStatus.proration.proratedCharge.toFixed(2)}
                      </span>
                    </div>
                    <div className="divider my-1"></div>
                    <div className="flex justify-between">
                      <span className="font-medium">Net Charge:</span>
                      <span
                        className={`font-bold ${
                          changeStatus.proration.netCharge >= 0
                            ? "text-primary"
                            : "text-success"
                        }`}
                      >
                        ₹{changeStatus.proration.netCharge.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="bg-base-200/60 rounded-lg p-5 border border-base-200/30">
                  <h3 className="font-semibold mb-3">Plan Comparison</h3>
                  <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                      <thead>
                        <tr>
                          <th>Plan</th>
                          <th>Price ({billingCycle})</th>
                          <th>Minutes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {plans.map((plan) => (
                          <tr
                            key={plan._id}
                            className={`${
                              subscription?.planId === plan._id
                                ? "bg-primary/10"
                                : ""
                            } cursor-pointer hover:bg-base-300`}
                            onClick={() => setSelectedPlan(plan._id)}
                          >
                            <td className="font-medium uppercase">
                              {plan.name}
                            </td>
                            <td>
                              ₹
                              {billingCycle === "monthly"
                                ? plan.monthlyPrice.toFixed(2)
                                : plan.yearlyPrice.toFixed(2)}
                            </td>
                            <td>{plan.minutesIncluded}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="text-center mt-4 text-base-content/70 text-sm">
                    <p>
                      Click on a plan row to select it and view detailed
                      features
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Minutes Section */}
        <div className="card bg-base-300/80 border-2 border-primary/30 shadow-lg">
          <div className="card-body p-6">
            <div className="flex items-center gap-2 mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-primary h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <h2 className="font-bold text-lg">Purchase Add-On Minutes</h2>
            </div>
            <div className="divider my-2"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">
                      Number of Minutes
                    </span>
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="1000"
                      value={minutes}
                      onChange={(e) => setMinutes(parseInt(e.target.value))}
                      className="range range-primary"
                      step="10"
                    />
                    <input
                      type="number"
                      className="input input-bordered w-24"
                      value={minutes}
                      onChange={(e) =>
                        setMinutes(parseInt(e.target.value) || 0)
                      }
                      min="1"
                    />
                  </div>
                </div>

                <div className="flex justify-center">
                  <div
                    className="radial-progress text-primary"
                    style={
                      {
                        "--value": Math.min(100, minutes / 10),
                        "--size": "8rem",
                      } as React.CSSProperties
                    }
                  >
                    {minutes} min
                  </div>
                </div>
              </div>

              {subscription && currentPlan && (
                <div className="flex flex-col justify-center">
                  <div className="stats shadow">
                    <div className="stat">
                      <div className="stat-title">Cost per Minute</div>
                      <div className="stat-value text-lg">
                        ₹{currentPlan.costPerAddOnMinute.toFixed(2)}
                      </div>
                    </div>
                    <div className="stat bg-primary text-primary-content">
                      <div className="stat-title">Total Cost</div>
                      <div className="stat-value text-2xl">
                        ₹{calculateAddOnCost()}
                      </div>
                    </div>
                  </div>

                  <button
                    className="btn btn-primary w-full mt-6"
                    onClick={handleAddMinutes}
                    disabled={!minutes || minutes <= 0}
                  >
                    Purchase Minutes
                  </button>
                </div>
              )}
            </div>

            {addStatus.message && (
              <div
                className={`alert ${
                  addStatus.success ? "alert-success" : "alert-error"
                } shadow-lg mt-4`}
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
          </div>
        </div>

        {/* Purchase History Section */}
        {subscription?.addOnPurchases &&
          subscription.addOnPurchases.length > 0 && (
            <div className="card bg-base-300/80 border-2 border-primary/30 shadow-lg">
              <div className="card-body p-6">
                <div className="flex items-center gap-2 mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-primary h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                  <h2 className="font-bold text-lg">Purchase History</h2>
                </div>
                <div className="divider my-2"></div>

                <div className="overflow-x-auto">
                  <table className="table table-zebra bg-base-200/60 border border-base-200/30">
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
                            {new Date(
                              purchase.purchaseDate
                            ).toLocaleDateString()}
                          </td>
                          <td>{purchase.minutes}</td>
                          <td>₹{purchase.price.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        {/* Billing History */}
        {subscriptionHistory && subscriptionHistory.length > 0 && (
          <div className="card bg-base-300/80 border-2 border-primary/30 shadow-lg">
            <div className="card-body p-6">
              <div className="flex items-center gap-2 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-primary h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
                <h2 className="font-bold text-lg">Billing History</h2>
              </div>
              <div className="divider my-2"></div>

              <div className="overflow-x-auto">
                <table className="table table-zebra bg-base-200/60 border border-base-200/30">
                  <thead>
                    <tr>
                      <th>Period</th>
                      <th>Plan</th>
                      <th>Billing Cycle</th>
                      <th>Minutes Used</th>
                      <th>Total Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptionHistory.map((history, idx) => {
                      const plan = plans.find((p) => p._id === history.planId);
                      return (
                        <tr key={idx}>
                          <td>
                            {new Date(history.startDate).toLocaleDateString()} -{" "}
                            {new Date(history.endDate).toLocaleDateString()}
                          </td>
                          <td className="uppercase">
                            {plan?.name || "Unknown"}
                          </td>
                          <td className="capitalize">{history.billingCycle}</td>
                          <td>
                            {history.consumedMinutes} /{" "}
                            {history.minutesIncluded +
                              history.additionalMinutes}
                          </td>
                          <td>₹{history.totalCost.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cancel Subscription Modal */}
      <dialog
        id="cancel_modal"
        className={`modal ${showCancelModal ? "modal-open" : ""}`}
      >
        <div className="modal-box">
          <h3 className="font-bold text-lg">Cancel Your Subscription</h3>
          <p className="py-4">
            Are you sure you want to cancel your subscription? This action
            cannot be undone.
          </p>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Cancellation Type</span>
            </label>
            <div className="join w-full">
              <button
                className={`join-item btn flex-1 ${
                  cancelType === "end_of_period" ? "btn-primary" : "btn-outline"
                }`}
                onClick={() => setCancelType("end_of_period")}
              >
                End of Period
              </button>
              <button
                className={`join-item btn flex-1 ${
                  cancelType === "immediate" ? "btn-primary" : "btn-outline"
                }`}
                onClick={() => setCancelType("immediate")}
              >
                Immediate
              </button>
            </div>
            <label className="label">
              <span className="label-text-alt">
                {cancelType === "immediate"
                  ? "Cancel immediately and lose remaining time"
                  : "Cancel at the end of your current billing period"}
              </span>
            </label>
          </div>

          {cancelStatus.message && (
            <div
              className={`alert ${
                cancelStatus.success ? "alert-success" : "alert-error"
              } shadow-lg mt-4`}
            >
              <div>
                {cancelStatus.success ? (
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
                <span>{cancelStatus.message}</span>
              </div>
            </div>
          )}

          <div className="modal-action">
            <button className="btn" onClick={() => setShowCancelModal(false)}>
              Close
            </button>
            <button
              className="btn btn-error"
              onClick={handleCancelSubscription}
            >
              Cancel Subscription
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setShowCancelModal(false)}>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default SubscriptionPage;
