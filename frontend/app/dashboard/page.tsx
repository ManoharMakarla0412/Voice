"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { BASE_URL } from "../utils/constants";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface Assistant {
  id: string;
  name: string;
  description?: string;
}

// Dummy data for charts (to match the image)
const lineChartData = {
  labels: ["", "", "", "", "", "", ""], // 7 points for daily data
  datasets: [
    {
      data: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.48], // Example for Total Call Minutes
      borderColor: "#f97316",
      backgroundColor: "rgba(249, 115, 22, 0.2)",
      fill: true,
      tension: 0.4,
    },
  ],
};

const numberOfCallsData = {
  labels: ["", "", "", "", "", "", ""],
  datasets: [
    {
      data: [0, 0, 1, 0, 0, 2, 0],
      borderColor: "#3b82f6",
      backgroundColor: "rgba(59, 130, 246, 0.2)",
      fill: true,
      tension: 0.4,
    },
  ],
};

const totalSpentData = {
  labels: ["", "", "", "", "", "", ""],
  datasets: [
    {
      data: [0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.04],
      borderColor: "#10b981",
      backgroundColor: "rgba(16, 185, 129, 0.2)",
      fill: true,
      tension: 0.4,
    },
  ],
};

const avgCostPerCallData = {
  labels: ["", "", "", "", "", "", ""],
  datasets: [
    {
      data: [0, 0.01, 0.02, 0.01, 0.02, 0.01, 0.02],
      borderColor: "#3b82f6",
      backgroundColor: "rgba(59, 130, 246, 0.2)",
      fill: true,
      tension: 0.4,
    },
  ],
};

const reasonCallEndedData = {
  labels: ["", "", "", "", "", "", ""],
  datasets: [
    {
      data: [0, 0, 0, 0, 0, 0, 1],
      borderColor: "#10b981",
      backgroundColor: "rgba(16, 185, 129, 0.2)",
      fill: true,
      tension: 0.4,
    },
  ],
};

const callDurationData = {
  labels: ["", "", "", "", "", "", ""],
  datasets: [
    {
      data: [0, 0.5, 1, 1.5, 1, 0.5, 0],
      borderColor: "#3b82f6",
      backgroundColor: "rgba(59, 130, 246, 0.2)",
      fill: true,
      tension: 0.4,
    },
  ],
};

const costBreakdownData = {
  labels: ["", "", "", "", "", "", ""],
  datasets: [
    {
      data: [0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.04],
      borderColor: "#f97316",
      backgroundColor: "rgba(249, 115, 22, 0.2)",
      fill: true,
      tension: 0.4,
    },
  ],
};

const callVolumeData = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  datasets: [
    {
      label: "Inbound",
      data: [40, 20, 30, 10, 20, 30, 40],
      borderColor: "#3b82f6",
      backgroundColor: "rgba(59, 130, 246, 0.3)",
      fill: true,
      tension: 0.4,
    },
    {
      label: "Outbound",
      data: [30, 30, 20, 20, 10, 20, 30],
      borderColor: "#10b981",
      backgroundColor: "rgba(16, 185, 129, 0.3)",
      fill: true,
      tension: 0.4,
    },
  ],
};

const callPerformanceData = {
  labels: ["Successful", "Failed", "Missed", "Busy"],
  datasets: [
    {
      data: [65, 15, 15, 5],
      backgroundColor: ["#10b981", "#3b82f6", "#f97316", "#ef4444"],
      borderWidth: 0,
    },
  ],
};

// Chart options for minimalistic design
const lineChartOptions = {
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false },
  },
  scales: {
    x: { display: false },
    y: { display: false },
  },
  elements: {
    point: { radius: 0 },
  },
  maintainAspectRatio: false,
};

const areaChartOptions = {
  plugins: {
    legend: { position: "bottom" as const, labels: { color: "#9ca3af" } },
    tooltip: { enabled: true },
  },
  scales: {
    x: { ticks: { color: "#9ca3af" } },
    y: { ticks: { color: "#9ca3af" } },
  },
  maintainAspectRatio: false,
};

const pieChartOptions = {
  plugins: {
    legend: { position: "bottom" as const, labels: { color: "#9ca3af" } },
    tooltip: { enabled: true },
  },
  maintainAspectRatio: false,
};

export default function Dashboard() {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssistants = async () => {
      try {
        const response = await fetch(`${BASE_URL}/assistant/get`);
        if (!response.ok) throw new Error("Failed to fetch assistants");
        const data = await response.json();
        setAssistants(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch assistants"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssistants();
  }, []);

  // Skeleton UI Component
  const SkeletonCard = () => (
    <div className="card bg-base-300 animate-pulse">
      <div className="card-body">
        <div className="h-4 bg-base-200 rounded-sm w-3/4 mb-2"></div>
        <div className="h-6 bg-base-200 rounded-sm w-1/2 mb-4"></div>
        <div className="h-20 bg-base-200 rounded-sm"></div>
      </div>
    </div>
  );

  const SkeletonLargeCard = () => (
    <div className="card bg-base-300 animate-pulse">
      <div className="card-body">
        <div className="h-5 bg-base-200 rounded-sm w-1/3 mb-2"></div>
        <div className="h-4 bg-base-200 rounded-sm w-2/3 mb-4"></div>
        <div className="h-60 bg-base-200 rounded-sm"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-base-300 text-base-content p-6">
      <div className="max-w-7xl mx-auto ">
        {isLoading ? (
          <>
            {/* Skeleton Overview Section */}
            <div className="h-8 bg-base-200 rounded-sm w-1/4 mb-2 animate-pulse"></div>
            <div className="h-4 bg-base-200 rounded-sm w-1/3 mb-6 animate-pulse"></div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>

            {/* Skeleton Call Analysis Section */}
            <div className="h-7 bg-base-200 rounded-sm w-1/5 mb-4 animate-pulse"></div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>

            {/* Skeleton Call Volume and Performance Section */}
            <div className="grid gap-4 sm:grid-cols-2">
              <SkeletonLargeCard />
              <SkeletonLargeCard />
            </div>
          </>
        ) : (
          <>
            {/* Actual Overview Section */}
            <h1 className="text-2xl font-semibold mb-2">Overview</h1>
            <p className="text-sm opacity-70 mb-6">
              Voice agent statistics & performance
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body p-6">
                  <p className="text-sm opacity-70">Total Call Minutes</p>
                  <p className="text-2xl font-bold">0.48</p>
                  <div className="h-20">
                    <Line data={lineChartData} options={lineChartOptions} />
                  </div>
                </div>
              </div>
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body p-6">
                  <p className="text-sm opacity-70">Number of Calls</p>
                  <p className="text-2xl font-bold">2</p>
                  <div className="h-20">
                    <Line data={numberOfCallsData} options={lineChartOptions} />
                  </div>
                </div>
              </div>
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body p-6">
                  <p className="text-sm opacity-70">Total Spent</p>
                  <p className="text-2xl font-bold">$0.05</p>
                  <div className="h-20">
                    <Line data={totalSpentData} options={lineChartOptions} />
                  </div>
                </div>
              </div>
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body p-6">
                  <p className="text-sm opacity-70">Average Cost per Call</p>
                  <p className="text-2xl font-bold">$0.02</p>
                  <div className="h-20">
                    <Line
                      data={avgCostPerCallData}
                      options={lineChartOptions}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actual Call Analysis Section */}
            <h2 className="text-xl font-semibold mb-4">Call Analysis</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body p-6">
                  <p className="text-sm opacity-70">Reason Call Ended</p>
                  <p className="text-xl font-bold">HANGUP</p>
                  <div className="h-20">
                    <Line
                      data={reasonCallEndedData}
                      options={lineChartOptions}
                    />
                  </div>
                </div>
              </div>
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body p-6">
                  <p className="text-sm opacity-70">
                    Average Call Duration by Assistant
                  </p>
                  <p className="text-xl font-bold">1.5 min</p>
                  <div className="h-20">
                    <Line data={callDurationData} options={lineChartOptions} />
                  </div>
                </div>
              </div>
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body p-6">
                  <p className="text-sm opacity-70">Cost Breakdown</p>
                  <p className="text-xl font-bold">$0.05</p>
                  <div className="h-20">
                    <Line data={costBreakdownData} options={lineChartOptions} />
                  </div>
                </div>
              </div>
            </div>

            {/* Actual Call Volume and Performance Section */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title text-lg">Call Volume</h2>
                  <p className="text-sm opacity-70">
                    Inbound vs Outbound calls
                  </p>
                  <div className="h-60 mt-4">
                    <Line data={callVolumeData} options={areaChartOptions} />
                  </div>
                </div>
              </div>
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title text-lg">Call Performance</h2>
                  <p className="text-sm opacity-70">
                    Breakdown of call outcomes
                  </p>
                  <div className="h-60 mt-4">
                    <Pie data={callPerformanceData} options={pieChartOptions} />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
