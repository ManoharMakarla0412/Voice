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

export interface BillingCycleHistory {
  startDate: string | Date;
  endDate: string | Date;
  planId: string;
  billingCycle: "monthly" | "yearly";
  minutesIncluded: number;
  additionalMinutes: number;
  consumedMinutes: number;
  addOnPurchases: AddOnPurchase[];
  totalCost: number;
  _id?: string;
}

export interface Subscription {
  _id: string;
  userId: string;
  planId: string;
  billingCycle: "monthly" | "yearly";
  status: "active" | "canceled" | "pending" | "past_due" | "unpaid";
  additionalMinutes: number;
  addOnPurchases: AddOnPurchase[];
  startDate: string | Date;
  endDate: string | Date;
  minutesIncluded: number;
  billingCycleHistory: BillingCycleHistory[];
  nextPlanId?: string;
  nextBillingCycle?: "monthly" | "yearly";
  cancelAtPeriodEnd?: boolean;
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
  proration?: {
    daysLeft: number;
    proratedRefund: number;
    proratedCharge: number;
    netCharge: number;
  };
}

export type ChangeType = "immediate" | "next_cycle";
export type CancelType = "immediate" | "end_of_period";

const useSubscription = () => {
  const [subscriptionData, setSubscriptionData] =
    useState<SubscriptionData | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [consumedMinutes, setConsumedMinutes] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState<
    BillingCycleHistory[]
  >([]);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("auth_token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(
        `${baseurl}/api/subscriptions/with-minutes`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );
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

  const fetchSubscriptionHistory = async () => {
    try {
      const token = sessionStorage.getItem("auth_token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${baseurl}/api/subscriptions/history`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to fetch subscription history"
        );
      }

      const data = await response.json();
      setSubscriptionHistory(data.data.history);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchConsumedMinutes = async () => {
    try {
      const token = sessionStorage.getItem("auth_token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(
        `${baseurl}/api/subscriptions/consumed-minutes`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to fetch consumed minutes"
        );
      }

      const data = await response.json();
      setConsumedMinutes(data.data.consumedMinutes);
    } catch (err: any) {
      setError(err.message);
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
    billingCycle: "monthly" | "yearly",
    changeType: ChangeType = "immediate"
  ): Promise<ChangeResult> => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("auth_token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${baseurl}/api/subscriptions/change-plan`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ planId, billingCycle, changeType }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to change plan");
      }

      const data = await response.json();

      // Refresh subscription data after change
      await fetchSubscription();

      return {
        success: true,
        message: data.message || "Plan updated successfully",
        proration: data.data.proration,
      };
    } catch (err: any) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async (
    cancelType: CancelType = "end_of_period"
  ): Promise<ChangeResult> => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("auth_token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${baseurl}/api/subscriptions/cancel`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ cancelType }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to cancel subscription");
      }

      const data = await response.json();

      // Refresh subscription data after cancellation
      await fetchSubscription();

      return {
        success: true,
        message: data.message || "Subscription canceled successfully",
      };
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

      const response = await fetch(`${baseurl}/api/subscriptions/add-minutes`, {
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
      setSubscriptionData((prev) =>
        prev ? { ...prev, subscription: data.data.subscription } : null
      );
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
    fetchConsumedMinutes();
    fetchSubscriptionHistory();
  }, []);

  const totalMinutes = subscriptionData?.totalMinutes || 0;
  const availableMinutes = Math.max(0, totalMinutes - consumedMinutes);

  return {
    subscription: subscriptionData?.subscription || null,
    plans,
    loading,
    error,
    changePlan,
    addMinutes,
    cancelSubscription,
    refreshSubscription: fetchSubscription,
    consumedMinutes,
    availableMinutes,
    totalMinutes,
    totalCost: subscriptionData?.totalCost || 0,
    subscriptionHistory,
  };
};

export default useSubscription;
