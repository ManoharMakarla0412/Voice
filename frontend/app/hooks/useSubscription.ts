"use client";
import { useState, useEffect } from "react";

const baseurl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003";

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
  status: "active" | "canceled" | "pending";
  additionalMinutes: number;
  addOnPurchases: AddOnPurchase[];
  startDate: string | Date;
  endDate: string | Date;
  minutesIncluded: number; // Added from Plan
}

export interface SubscriptionData {
  subscription: Subscription;
  consumedMinutes: number;
  availableMinutes: number;
  totalMinutes: number;
  totalCost: number;
}

export interface ChangeResult {
  success: boolean;
  message: string;
}

const useSubscription = () => {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("auth_token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${baseurl}/api/subscription/with-minutes`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch subscription");
      }

      const data = await response.json();
      setSubscriptionData(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const token = sessionStorage.getItem("auth_token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${baseurl}/api/plans`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch plans");
      }

      const data = await response.json();
      setPlans(data.data.plans);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const changePlan = async (
    planId: string,
    billingCycle: "monthly" | "yearly"
  ): Promise<ChangeResult> => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("auth_token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${baseurl}/api/subscription/change-plan`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ planId, billingCycle }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to change plan");
      }

      const data = await response.json();
      setSubscriptionData(prev => prev ? { ...prev, subscription: data.data.subscription } : null);
      return { success: true, message: "Plan updated successfully" };
    } catch (err: any) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const addMinutes = async (minutes: number): Promise<ChangeResult> => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("auth_token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${baseurl}/api/subscription/add-minutes`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ minutes }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add minutes");
      }

      const data = await response.json();
      setSubscriptionData(prev => prev ? { ...prev, subscription: data.data.subscription } : null);
      return { success: true, message: "Minutes added successfully" };
    } catch (err: any) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
    fetchPlans();
  }, []);

  return {
    subscription: subscriptionData?.subscription || null,
    plans,
    loading,
    error,
    changePlan,
    addMinutes,
    refreshSubscription: fetchSubscription,
    consumedMinutes: subscriptionData?.consumedMinutes || 0,
    availableMinutes: subscriptionData?.availableMinutes || 0,
    totalMinutes: subscriptionData?.totalMinutes || 0,
    totalCost: subscriptionData?.totalCost || 0,
  };
};

export default useSubscription;