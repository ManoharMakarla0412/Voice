"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  Clock,
  User,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Timer,
  Smile,
  BarChart3,
  PieChart,
  Activity,
  Users,
  CalendarCheck,
  MessageSquare,
  BrainCircuit,
  Save,
  BarChart,
  PhoneCall,
  PhoneMissed,
  HelpCircle,
} from "lucide-react";
import { Line, Pie, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { BASE_URL } from "../utils/constants";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Assistant {
  id: string;
  name: string;
  description?: string;
}

// Call Minutes Data
const callMinutesData = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  datasets: [
    {
      data: [95, 120, 105, 145, 160, 130, 85],
      borderColor: "#f97316",
      backgroundColor: "rgba(249, 115, 22, 0.2)",
      fill: true,
      tension: 0.4,
    },
  ],
};

// Number of Calls Data
const numberOfCallsData = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  datasets: [
    {
      data: [24, 32, 28, 36, 42, 34, 22],
      backgroundColor: "rgba(59, 130, 246, 0.7)",
      borderRadius: 4,
    },
  ],
};

// Call Types Breakdown
const callTypesData = {
  labels: [
    "Appointment Booking",
    "Rescheduling",
    "Cancellation",
    "General Inquiry",
    "Emergency",
    "Follow-up",
  ],
  datasets: [
    {
      data: [40, 20, 10, 15, 5, 10],
      backgroundColor: [
        "rgba(16, 185, 129, 0.8)",
        "rgba(59, 130, 246, 0.8)",
        "rgba(249, 115, 22, 0.8)",
        "rgba(168, 85, 247, 0.8)",
        "rgba(236, 72, 153, 0.8)",
        "rgba(245, 158, 11, 0.8)",
      ],
      borderWidth: 0,
    },
  ],
};

// Time Saved Data
const timeSavedData = {
  labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
  datasets: [
    {
      label: "Hours Saved",
      data: [12, 15, 18, 22],
      borderColor: "#10b981",
      backgroundColor: "rgba(16, 185, 129, 0.2)",
      fill: true,
      tension: 0.4,
    },
  ],
};

// AI Resolution Rate
const aiResolutionData = {
  labels: ["Resolved by AI", "Transferred to Human", "Follow-up Required"],
  datasets: [
    {
      data: [75, 15, 10],
      backgroundColor: [
        "rgba(16, 185, 129, 0.8)",
        "rgba(249, 115, 22, 0.8)",
        "rgba(59, 130, 246, 0.8)",
      ],
      borderWidth: 0,
    },
  ],
};

// Customer Satisfaction
const satisfactionData = {
  labels: [
    "Very Satisfied",
    "Satisfied",
    "Neutral",
    "Unsatisfied",
    "Very Unsatisfied",
  ],
  datasets: [
    {
      data: [45, 30, 15, 7, 3],
      backgroundColor: [
        "rgba(16, 185, 129, 0.8)",
        "rgba(59, 130, 246, 0.8)",
        "rgba(245, 158, 11, 0.8)",
        "rgba(249, 115, 22, 0.8)",
        "rgba(239, 68, 68, 0.8)",
      ],
      borderWidth: 0,
    },
  ],
};

// Call Volume Data (keep as requested)
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

// Call Performance Data (keep as requested)
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

// Peak Hours Data
const peakHoursData = {
  labels: [
    "8am",
    "9am",
    "10am",
    "11am",
    "12pm",
    "1pm",
    "2pm",
    "3pm",
    "4pm",
    "5pm",
  ],
  datasets: [
    {
      data: [12, 24, 32, 28, 18, 15, 25, 30, 22, 14],
      backgroundColor: "rgba(59, 130, 246, 0.7)",
      borderRadius: 4,
    },
  ],
};

// Chart Options
const miniChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true },
  },
  scales: {
    x: { display: false },
    y: { display: false },
  },
};

const standardBarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: "#9ca3af" },
    },
    y: {
      grid: { color: "rgba(156, 163, 175, 0.1)" },
      ticks: { color: "#9ca3af" },
    },
  },
};

const horizontalBarOptions = {
  indexAxis: "y" as const,
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true },
  },
  scales: {
    x: {
      grid: { color: "rgba(156, 163, 175, 0.1)" },
      ticks: { color: "#9ca3af" },
    },
    y: {
      grid: { display: false },
      ticks: { color: "#9ca3af" },
    },
  },
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom" as const,
      labels: {
        color: "#9ca3af",
        boxWidth: 12,
        padding: 8,
        font: { size: 11 },
      },
    },
    tooltip: { enabled: true },
  },
  cutout: "65%",
};

const areaChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom" as const,
      labels: { color: "#9ca3af", boxWidth: 12, padding: 15 },
    },
    tooltip: { enabled: true },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: "#9ca3af" },
    },
    y: {
      grid: { color: "rgba(156, 163, 175, 0.1)" },
      ticks: { color: "#9ca3af" },
    },
  },
};

const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom" as const,
      align: "start" as const,
      labels: {
        color: "#9ca3af",
        boxWidth: 12,
        padding: 10,
        font: { size: 11 },
      },
    },
    tooltip: { enabled: true },
  },
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

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {isLoading ? (
          // Skeleton loading states
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="card bg-base-200 shadow-lg h-[250px] animate-pulse"
                >
                  <div className="card-body p-5">
                    <div className="h-4 w-2/3 bg-base-300 rounded-full mb-4"></div>
                    <div className="h-8 w-1/2 bg-base-300 rounded-full mb-6"></div>
                    <div className="h-32 bg-base-300 rounded-lg"></div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <>
            {/* Page Header */}
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                  <Phone className="h-8 w-8 text-primary" />
                  Voice AI Assistant Dashboard
                </h1>
                <p className="text-base-content/70 mt-2">
                  Monitor your AI call agent performance, call analytics, and
                  business impact
                </p>
              </div>

              <div className="join shadow-md">
                <button className="join-item btn btn-sm">Day</button>
                <button className="join-item btn btn-sm btn-active">
                  Week
                </button>
                <button className="join-item btn btn-sm">Month</button>
                <button className="join-item btn btn-sm">Year</button>
              </div>
            </div>

            {/* Key Stats - Row 1 - Smaller cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Total Calls */}
              <div className="card bg-base-200 shadow-lg border border-base-300/50">
                <div className="card-body p-5">
                  <div className="flex justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium flex items-center gap-1">
                        <PhoneCall size={16} className="text-primary" />
                        Total Calls
                      </span>
                      <span className="mt-2 text-2xl font-bold">218</span>
                    </div>
                    <div className="badge badge-sm badge-success gap-1 h-6">
                      <TrendingUp size={12} />
                      <span>12%</span>
                    </div>
                  </div>
                  <div className="h-20 mt-3">
                    <Bar data={numberOfCallsData} options={miniChartOptions} />
                  </div>
                </div>
              </div>

              {/* Call Minutes */}
              <div className="card bg-base-200 shadow-lg border border-base-300/50">
                <div className="card-body p-5">
                  <div className="flex justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium flex items-center gap-1">
                        <Clock size={16} className="text-primary" />
                        Call Minutes
                      </span>
                      <span className="mt-2 text-2xl font-bold">840</span>
                    </div>
                    <div className="badge badge-sm badge-success gap-1 h-6">
                      <TrendingUp size={12} />
                      <span>8%</span>
                    </div>
                  </div>
                  <div className="h-20 mt-3">
                    <Line data={callMinutesData} options={miniChartOptions} />
                  </div>
                </div>
              </div>

              {/* AI Resolution Rate */}
              <div className="card bg-base-200 shadow-lg border border-base-300/50">
                <div className="card-body p-5">
                  <div className="flex justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium flex items-center gap-1">
                        <BrainCircuit size={16} className="text-primary" />
                        AI Resolution Rate
                      </span>
                      <span className="mt-2 text-2xl font-bold">75%</span>
                    </div>
                    <div className="badge badge-sm badge-success gap-1 h-6">
                      <TrendingUp size={12} />
                      <span>5%</span>
                    </div>
                  </div>
                  <div className="h-20 mt-3">
                    <Pie
                      data={{
                        labels: ["Resolved", "Transfer"],
                        datasets: [
                          {
                            data: [75, 25],
                            backgroundColor: [
                              "rgba(16, 185, 129, 0.8)",
                              "rgba(249, 115, 22, 0.8)",
                            ],
                            borderWidth: 0,
                          },
                        ],
                      }}
                      options={miniChartOptions}
                    />
                  </div>
                </div>
              </div>

              {/* Time Saved */}
              <div className="card bg-base-200 shadow-lg border border-base-300/50">
                <div className="card-body p-5">
                  <div className="flex justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium flex items-center gap-1">
                        <Save size={16} className="text-primary" />
                        Time Saved (hrs)
                      </span>
                      <span className="mt-2 text-2xl font-bold">67</span>
                    </div>
                    <div className="badge badge-sm badge-success gap-1 h-6">
                      <TrendingUp size={12} />
                      <span>22%</span>
                    </div>
                  </div>
                  <div className="h-20 mt-3">
                    <Line data={timeSavedData} options={miniChartOptions} />
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2 - Call Types + AI Resolution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Call Types */}
              <div className="card bg-base-200 shadow-lg border border-base-300/50">
                <div className="card-body p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart className="text-primary" size={18} />
                    <h3 className="font-bold text-lg">Call Type Breakdown</h3>
                  </div>
                  <div className="h-[250px] flex items-center justify-center">
                    <Pie data={callTypesData} options={pieChartOptions} />
                  </div>
                  <div className="flex justify-between text-xs text-base-content/70 mt-4">
                    <span>Total Calls: 218</span>
                    <span>Most Common: Appointment Booking (40%)</span>
                  </div>
                </div>
              </div>

              {/* AI Resolution */}
              <div className="card bg-base-200 shadow-lg border border-base-300/50">
                <div className="card-body p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <BrainCircuit className="text-primary" size={18} />
                    <h3 className="font-bold text-lg">
                      AI Resolution Breakdown
                    </h3>
                  </div>
                  <div className="h-[250px] flex items-center justify-center">
                    <Doughnut
                      data={aiResolutionData}
                      options={doughnutOptions}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-base-content/70 mt-4">
                    <span>Total Calls: 218</span>
                    <span>AI Resolution: 75%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3 - Time Saved Chart (full width) */}
            <div className="card bg-base-200 shadow-lg border border-base-300/50 mb-6">
              <div className="card-body p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Save className="text-primary" size={18} />
                  <h3 className="font-bold text-lg">
                    Staff Time Saved (Weekly)
                  </h3>
                </div>
                <div className="h-[300px]">
                  <Line data={timeSavedData} options={areaChartOptions} />
                </div>
                <div className="flex justify-between text-xs text-base-content/70 mt-4">
                  <span>Total Hours Saved: 67</span>
                  <span>YoY Growth: +22%</span>
                </div>
              </div>
            </div>

            {/* Row 4 - Two Column Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Customer Satisfaction */}
              <div className="card bg-base-200 shadow-lg border border-base-300/50">
                <div className="card-body p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Smile className="text-primary" size={18} />
                    <h3 className="font-bold text-lg">Customer Satisfaction</h3>
                  </div>
                  <div className="h-[250px]">
                    <Bar data={satisfactionData} options={standardBarOptions} />
                  </div>
                  <div className="flex justify-between text-xs text-base-content/70 mt-4">
                    <span>Overall Satisfaction: 75%</span>
                    <span>Year-over-year: +5%</span>
                  </div>
                </div>
              </div>

              {/* Peak Call Hours */}
              <div className="card bg-base-200 shadow-lg border border-base-300/50">
                <div className="card-body p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="text-primary" size={18} />
                    <h3 className="font-bold text-lg">Peak Call Hours</h3>
                  </div>
                  <div className="h-[250px]">
                    <Bar data={peakHoursData} options={standardBarOptions} />
                  </div>
                  <div className="flex justify-between text-xs text-base-content/70 mt-4">
                    <span>Peak Hour: 10am</span>
                    <span>Least Busy: 5pm</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 5 - Call Volume and Performance - KEEPING AS REQUESTED */}
            <div className="card bg-base-300/80 border-2 border-primary/30 shadow-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Phone className="text-primary" size={20} />
                <h2 className="text-xl font-bold">Call Analytics</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Call Volume */}
                <div className="card bg-base-200 shadow-lg">
                  <div className="card-body p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart3 className="text-primary" size={18} />
                      <h3 className="font-bold text-lg">Call Volume</h3>
                    </div>
                    <div className="h-[280px]">
                      <Line data={callVolumeData} options={areaChartOptions} />
                    </div>
                    <div className="flex justify-between text-xs text-base-content/70 mt-4">
                      <span>Total Calls: 190</span>
                      <span>Peak Day: Monday</span>
                    </div>
                  </div>
                </div>

                {/* Call Performance */}
                <div className="card bg-base-200 shadow-lg">
                  <div className="card-body p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="text-primary" size={18} />
                      <h3 className="font-bold text-lg">Call Performance</h3>
                    </div>
                    <div className="h-[280px] flex items-center justify-center">
                      <Pie
                        data={callPerformanceData}
                        options={pieChartOptions}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-base-content/70 mt-4">
                      <span>Successful Calls: 65%</span>
                      <span>Missed Calls: 15%</span>
                    </div>
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
