"use client";
import { useState, useEffect } from "react";

const baseurl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003";

// Define TypeScript interfaces
export interface Feature {
  title: string;
  monthly: boolean;
  yearly: boolean;
  _id?: string;
}

export interface Plan {
  _id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  features: Feature[];
  minutesIncluded: number;
  costPerAddOnMinute: number;
}

export interface AddOnPurchase {
  minutes: number;
  purchaseDate: string | Date;
  price: number;
  _id?: string;
}

export interface Subscription {
  _id: string;
  userId: string;
  planId: string;
  billingCycle: "monthly" | "yearly";
  status: "active" | "canceled" | "expired";
  additionalMinutes: number;
  addOnPurchases: AddOnPurchase[];
  nextBillingDate?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ChangeResult {
  success: boolean;
  message: string;
}

const useSubscription = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

// Fetch user's subscription data
const fetchSubscription = async () => {
  try {
    setLoading(true);
    const response = await fetch(`${baseurl}/api/subscription/`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${sessionStorage.getItem("auth_token")}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch subscription");

    const data = await response.json();
    setSubscription(data.data.subscription);
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  // Fetch available plans
  const fetchPlans = async () => {
    try {
      const response = await fetch(`${baseurl}/api/plans`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionStorage.getItem("auth_token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch plans");

      const data = await response.json();
      setPlans(data.data.plans);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Change plan
  const changePlan = async (
    planId: string,
    billingCycle: "monthly" | "yearly"
  ): Promise<ChangeResult> => {
    try {
      setLoading(true);
      const response = await fetch(`${baseurl}/api/subscription/change-plan`, {
        method: "PUT", // Changed from POST to PUT to match your backend
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({ planId, billingCycle }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to change plan");
      }

      const data = await response.json();
      setSubscription(data.data.subscription);
      return { success: true, message: "Plan updated successfully" };
    } catch (err: any) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Add minutes
  const addMinutes = async (minutes: number): Promise<ChangeResult> => {
    try {
      setLoading(true);
      const response = await fetch(`${baseurl}/api/subscription/add-minutes`, {
        method: "PUT", // Changed from POST to PUT to match your backend
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({ minutes }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add minutes");
      }

      const data = await response.json();
      setSubscription(data.data.subscription);
      return { success: true, message: "Minutes added successfully" };
    } catch (err: any) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Load subscription and plans on mount
  useEffect(() => {
    fetchSubscription();
    fetchPlans();
  }, []);

  return {
    subscription,
    plans,
    loading,
    error,
    changePlan,
    addMinutes,
    refreshSubscription: fetchSubscription,
  };
};

export default useSubscription;
