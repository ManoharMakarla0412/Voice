"use client";

import { Check, X } from "lucide-react";
import { useState } from "react";

interface PricingFeature {
  title: string;
  monthly: boolean;
  yearly: boolean;
}

interface PricingPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  features: PricingFeature[];
  popular?: boolean;
}

interface PricingProps {
  onPlanSelect: (planType: string, billingCycle: "monthly" | "yearly") => void;
}

export function PricingSection({ onPlanSelect }: PricingProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );

  const plans: PricingPlan[] = [
    {
      id: "basic",
      name: "Basic",
      monthlyPrice: 20,
      yearlyPrice: 110000,
      description: "Perfect for small teams and startups",
      features: [
        { title: "1 Voice Assistant", monthly: true, yearly: true },
        { title: "500 Minutes per Month", monthly: true, yearly: true },
        { title: "Email Support", monthly: true, yearly: true },
        { title: "Basic Call Analytics", monthly: true, yearly: true },
        { title: "CRM Integration", monthly: false, yearly: true },
        { title: "Priority Support", monthly: false, yearly: false },
      ],
    },
    {
      id: "pro",
      name: "Pro",
      monthlyPrice: 17,
      yearlyPrice: 170000,
      description: "For growing businesses with more needs",
      popular: true,
      features: [
        { title: "3 Voice Assistants", monthly: true, yearly: true },
        { title: "1000 Minutes per Month", monthly: true, yearly: true },
        { title: "Email & Chat Support", monthly: true, yearly: true },
        { title: "Advanced Call Analytics", monthly: true, yearly: true },
        { title: "CRM Integration", monthly: true, yearly: true },
        { title: "Priority Support", monthly: false, yearly: false },
      ],
    },
    {
      id: "enterprise",
      name: "Enterprise",
      monthlyPrice: 15,
      yearlyPrice: 280000,
      description: "For large organizations with custom needs",
      features: [
        { title: "10 Voice Assistants", monthly: true, yearly: true },
        { title: "2000 Minutes per Month", monthly: true, yearly: true },
        { title: "24/7 Phone Support", monthly: true, yearly: true },
        { title: "Enterprise Analytics", monthly: true, yearly: true },
        { title: "Custom CRM Integration", monthly: true, yearly: true },
        { title: "Dedicated Account Manager", monthly: true, yearly: true },
      ],
    },
  ];

  // Calculate savings for yearly billing
  const getSavingsPercentage = (monthly: number, yearly: number) => {
    const monthlyCost = monthly * 12;
    const yearlyCost = yearly;
    return Math.round((1 - yearlyCost / monthlyCost) * 100);
  };

  return (
    <div className="mx-auto card bg-base-100/30 backdrop-blur-md border-base-200/30 hover:border-base-200/40 transition-all shadow-xl max-w-6xl">
      <div className="card-body p-5">
        <h2 className="card-title text-2xl font-bold text-center justify-center">
          Choose Your Plan
        </h2>
        <p className="text-center text-base-content/70 mb-6">
          Select a plan that works best for your business needs
        </p>

        {/* Billing toggle */}
        <div className="flex items-center justify-center mb-6">
          <div className="join bg-base-200/40 backdrop-blur-sm p-1 rounded-lg">
            <button
              className={`join-item btn btn-sm ${
                billingCycle === "monthly" ? "btn-primary" : "btn-ghost"
              }`}
              onClick={() => setBillingCycle("monthly")}
            >
              Monthly
            </button>
            <button
              className={`join-item btn btn-sm ${
                billingCycle === "yearly" ? "btn-primary" : "btn-ghost"
              }`}
              onClick={() => setBillingCycle("yearly")}
            >
              Yearly
              <span className="badge badge-sm badge-soft badge-success ml-2">
                Save upto 22%
              </span>
            </button>
          </div>
        </div>

        {/* Plan cards - horizontal layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`
                card bg-base-100/20 backdrop-blur-md border ${
                  plan.popular
                    ? "border-primary/40 shadow-md"
                    : "border-primary/20 hover:border-primary/40"
                }
                transition-all duration-300 max-w-sm
                flex flex-col h-full
              `}
            >
              {plan.popular && (
                <div className="absolute -top-3 right-4">
                  <span className="badge badge-primary badge-soft">
                    Popular Choice
                  </span>
                </div>
              )}

              <div className="card-body p-4 flex flex-col">
                <h3 className="font-bold text-lg">{plan.name}</h3>
                <div className="mt-1">
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold">
                      ₹
                      {billingCycle === "monthly"
                        ? plan.monthlyPrice
                        : plan.yearlyPrice}
                    </span>
                    <span className="text-sm text-base-content/70 ml-1">
                      /{billingCycle === "monthly" ? "minute" : "yr"}
                    </span>
                  </div>
                  {billingCycle === "yearly" && (
                    <div className="text-xs text-success mt-1">
                      Save{" "}
                      {getSavingsPercentage(
                        plan.monthlyPrice,
                        plan.yearlyPrice
                      )}
                      % with annual billing
                    </div>
                  )}
                </div>

                <p className="text-sm text-base-content/70 mt-2">
                  {plan.description}
                </p>

                <div className="divider my-2"></div>

                <ul className="space-y-2 grow">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      {feature[billingCycle] ? (
                        <Check className="h-4 w-4 text-success mr-2 shrink-0" />
                      ) : (
                        <X className="h-4 w-4 text-base-content/30 mr-2 shrink-0" />
                      )}
                      <span
                        className={`text-sm ${
                          !feature[billingCycle] ? "text-base-content/50" : ""
                        }`}
                      >
                        {feature.title}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="card-actions justify-center mt-4">
                  <button
                    className={`btn btn-block ${
                      plan.popular ? "btn-primary" : "btn-outline"
                    }`}
                    onClick={() => onPlanSelect(plan.id, billingCycle)}
                  >
                    Select {plan.name} Plan
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
