"use client";

import { useState } from "react";
import { PricingCard } from "./pricing-card";

interface PricingSectionProps {
  onPlanSelect: (plan: "monthly" | "yearly") => void;
}

export function PricingSection({ onPlanSelect }: PricingSectionProps) {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly" | null>(
    null
  );

  const monthlyFeatures = [
    { text: "100 minutes every month" },
    { text: "Create 1 Voice Agent" },
    { text: "3 Basic Voices" },
    { text: "1 Workspace" },
    { text: "1 Team Member" },
  ];

  const yearlyFeatures = [
    { text: "Unlimited Minutes" },
    { text: "5 Voice Agents" },
    { text: "10 Advanced Voices" },
    { text: "3 Workspaces" },
    { text: "5 Team Members" },
  ];

  const handlePlanSelect = (plan: "monthly" | "yearly") => {
    setSelectedPlan(plan);
    onPlanSelect(plan);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <h1 className="text-5xl font-bold text-white text-center mb-12">
        Pricing
      </h1>
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <PricingCard
          title="Monthly"
          price="1999"
          subtitle="Pay as you go"
          features={monthlyFeatures}
          onSelect={() => handlePlanSelect("monthly")}
          isSelected={selectedPlan === "monthly"}
        />
        <PricingCard
          title="Yearly"
          price="19999"
          subtitle="Cancel anytime"
          features={yearlyFeatures}
          onSelect={() => handlePlanSelect("yearly")}
          isSelected={selectedPlan === "yearly"}
        />
      </div>
    </div>
  );
}
