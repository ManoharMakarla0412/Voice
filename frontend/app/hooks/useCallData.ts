"use client";

import { useState, useEffect } from "react";
import { BASE_URL } from "../utils/constants";

interface CallLog {
  _id: string;
  callId: string;
  orgId: string;
  type: string;
  startedAt: string;
  endedAt: string;
  minutes: number;
  cost: number;
  status: string;
  customerNumber: string | null;
  assistantId: string | null;
  assistant: {
    _id: string;
    name?: string;
    firstMessage?: string;
    voiceProvider?: string;
    voiceId?: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface CallStats {
  totalCalls: number;
  totalMinutes: number;
  callsByDay: number[]; // [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
  minutesByDay: number[]; // [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
}

export const useCallData = () => {
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [callStats, setCallStats] = useState<CallStats>({
    totalCalls: 0,
    totalMinutes: 0,
    callsByDay: Array(7).fill(0), // Default to zeros for 7 days
    minutesByDay: Array(7).fill(0),
  });
  const [logsLoading, setLogsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [logsError, setLogsError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);

  const fetchCallLogs = async () => {
    try {
      setLogsLoading(true);
      const token = sessionStorage.getItem("auth_token");
      if (!token) throw new Error("No authentication token found");

      console.log("Fetching call logs from:", `${BASE_URL}/api/calls`);
      const response = await fetch(`${BASE_URL}/api/calls`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch call logs");
      }
      const data = await response.json();
      setCallLogs(data.callLogs);
    } catch (error) {
      console.error("Error fetching call logs:", error);
      setLogsError(
        error instanceof Error ? error.message : "Failed to fetch call logs"
      );
    } finally {
      setLogsLoading(false);
    }
  };

  const fetchCallStats = async () => {
    try {
      setStatsLoading(true);
      const token = sessionStorage.getItem("auth_token");
      if (!token) throw new Error("No authentication token found");

      console.log("Fetching call stats from:", `${BASE_URL}/api/calls/stats`);
      const response = await fetch(`${BASE_URL}/api/calls/stats`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch call stats");
      }
      const data = await response.json();
      setCallStats(data.stats); // Expecting { totalCalls, totalMinutes, callsByDay, minutesByDay }
    } catch (error) {
      console.error("Error fetching call stats:", error);
      setStatsError(
        error instanceof Error ? error.message : "Failed to fetch call stats"
      );
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchCallLogs();
    fetchCallStats();
  }, []);

  return {
    callLogs,
    callStats,
    logsLoading,
    statsLoading,
    logsError,
    statsError,
  };
};