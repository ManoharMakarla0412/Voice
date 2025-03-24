"use client";

import React, { useEffect, useState } from "react";
import { BASE_URL } from "../../utils/constants";

// Define the interface for call logs
interface CallLog {
  id: string;
  assistantId: string | null;
  type: string;
  startedAt: string;
  endedAt: string;
  cost: number;
  endedReason: string;
  // Add additional fields as needed
}

const CallLogs = () => {
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;

  useEffect(() => {
    // Fetch call logs from the backend API
    const fetchCallLogs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/api/calls/logs`);
        if (!response.ok) {
          throw new Error("Failed to fetch call logs");
        }
        const data = await response.json();
        setCallLogs(data.callLogs);
      } catch (error) {
        console.error("Error fetching call logs:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch call logs"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCallLogs();
  }, []);

  // Filter logs based on search query
  const filteredLogs = callLogs.filter((log) => {
    const query = searchQuery.toLowerCase();
    return (
      log.id.toLowerCase().includes(query) ||
      log.assistantId?.toLowerCase().includes(query) ||
      false ||
      log.type.toLowerCase().includes(query) ||
      log.endedReason.toLowerCase().includes(query)
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage
  );

  const getCallDuration = (startedAt: string, endedAt: string) => {
    const durationSeconds = Math.round(
      (new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000
    );

    if (durationSeconds < 60) {
      return `${durationSeconds} sec`;
    }

    const minutes = Math.floor(durationSeconds / 60);
    const seconds = durationSeconds % 60;
    return `${minutes}m ${seconds}s`;
  };

  // Generate pagination items
  const getPaginationItems = () => {
    const items = [];
    const maxItems = 5; // Show max 5 page numbers at a time

    let startPage = Math.max(1, currentPage - Math.floor(maxItems / 2));
    let endPage = Math.min(totalPages, startPage + maxItems - 1);

    if (endPage - startPage + 1 < maxItems) {
      startPage = Math.max(1, endPage - maxItems + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(i);
    }

    return items;
  };

  return (
    <div className="min-h-screen bg-base-100 p-6">
      {/* Breadcrumb */}
      <div className="text-sm breadcrumbs mb-6">
        <ul>
          <li>
            <a href="/dashboard" className="text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="w-4 h-4 mr-2 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                ></path>
              </svg>
              Dashboard
            </a>
          </li>
          <li className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="w-4 h-4 mr-2 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              ></path>
            </svg>
            Call Logs
          </li>
        </ul>
      </div>

      <div className="max-w-[1400px] mx-auto">
        {/* Header Card */}
        <div className="card bg-base-200 shadow-md mb-6">
          <div className="card-body">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <h1 className="card-title text-2xl mb-2">Call Logs</h1>
                <p className="text-base-content/70">
                  Track and analyze your voice assistant interactions
                </p>
              </div>

              {/* Stats */}
              <div className="stats shadow-sm bg-base-300">
                <div className="stat">
                  <div className="stat-figure text-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      className="inline-block w-8 h-8 stroke-current"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      ></path>
                    </svg>
                  </div>
                  <div className="stat-title">Total Calls</div>
                  <div className="stat-value text-primary">
                    {callLogs.length}
                  </div>
                </div>
                <div className="stat">
                  <div className="stat-figure text-secondary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      className="inline-block w-8 h-8 stroke-current"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                  </div>
                  <div className="stat-title">Total Cost</div>
                  <div className="stat-value text-secondary">
                    $
                    {callLogs
                      .reduce((sum, log) => sum + log.cost, 0)
                      .toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card bg-base-200 shadow-md mb-6">
          <div className="card-body">
            <div className="flex flex-wrap items-center gap-2">
              <div className="form-control grow max-w-xs">
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Search calls..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input input-bordered focus:outline-primary w-full"
                  />
                  <button className="btn btn-square btn-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </button>
                </div>
                <label className="label">
                  <span className="label-text">
                    Search by ID, assistant, type or reason
                  </span>
                </label>
              </div>

              {searchQuery && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setSearchQuery("")}
                >
                  Clear search
                </button>
              )}

              <div className="grow"></div>

              {/* Call type filter */}
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-outline m-1">
                  Filter by type
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 ml-2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
                    />
                  </svg>
                </label>
                <ul
                  tabIndex={0}
                  className="dropdown-content z-1 menu p-2 shadow-sm bg-base-200 rounded-box w-52"
                >
                  <li>
                    <a>All Types</a>
                  </li>
                  <li>
                    <a>Web Calls</a>
                  </li>
                  <li>
                    <a>Inbound Calls</a>
                  </li>
                  <li>
                    <a>Outbound Calls</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="card bg-base-200 shadow-md overflow-hidden">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="table table-zebra table-compact w-full">
                <thead>
                  <tr className="bg-base-300">
                    <th className="text-base-content/80 font-semibold">Type</th>
                    <th className="text-base-content/80 font-semibold">
                      Call ID
                    </th>
                    <th className="text-base-content/80 font-semibold">Cost</th>
                    <th className="text-base-content/80 font-semibold">
                      Ended Reason
                    </th>
                    <th className="text-base-content/80 font-semibold">
                      Assistant
                    </th>
                    <th className="text-base-content/80 font-semibold">
                      Phone Number
                    </th>
                    <th className="text-base-content/80 font-semibold">
                      Start Time
                    </th>
                    <th className="text-base-content/80 font-semibold">
                      Duration
                    </th>
                    <th className="text-base-content/80 font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center">
                          <span className="loading loading-spinner loading-lg text-primary mb-2"></span>
                          <span className="text-base-content/70">
                            Loading call logs...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12">
                        <div className="alert alert-error max-w-md mx-auto shadow-lg">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="stroke-current shrink-0 h-6 w-6"
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
                            <div className="text-xs">{error}</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedLogs.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-16">
                        <div className="flex flex-col items-center justify-center">
                          <div className="mb-4">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-16 h-16 text-base-content/30"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1"
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1"
                                d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5"
                              />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold text-base-content/70">
                            No call logs found
                          </h3>
                          {searchQuery && (
                            <p className="text-base-content/50 mt-1">
                              Try changing your search query
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedLogs.map((log) => (
                      <tr key={log.id} className="hover">
                        <td>
                          <div
                            className={`
                            badge 
                            ${log.type === "webCall" ? "badge-info" : ""}
                            ${log.type === "inbound" ? "badge-success" : ""}
                            ${log.type === "outbound" ? "badge-warning" : ""}
                            ${
                              !["webCall", "inbound", "outbound"].includes(
                                log.type
                              )
                                ? "badge-ghost"
                                : ""
                            }
                          `}
                          >
                            {log.type === "webCall" ? "Web" : log.type}
                          </div>
                        </td>
                        <td className="font-mono text-xs">
                          <div className="flex items-center gap-2">
                            <span className="truncate max-w-[100px]">
                              {log.id}
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(log.id);
                                // Optional: Show a tooltip or toast for feedback
                              }}
                              className="btn btn-ghost btn-xs"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                        <td>
                          <div className="font-mono">
                            ${log.cost.toFixed(2)}
                          </div>
                        </td>
                        <td>
                          <div
                            className={`
                            badge badge-outline
                            ${
                              log.endedReason === "caller-hung-up"
                                ? "badge-success"
                                : ""
                            }
                            ${
                              log.endedReason === "disconnected"
                                ? "badge-error"
                                : ""
                            }
                            ${
                              log.endedReason === "completed"
                                ? "badge-info"
                                : ""
                            }
                          `}
                          >
                            {log.endedReason.replace(/-/g, " ")}
                          </div>
                        </td>
                        <td>
                          {log.assistantId ? (
                            <div
                              className="tooltip"
                              data-tip="View assistant details"
                            >
                              <button className="btn btn-ghost btn-xs">
                                {log.assistantId.substring(0, 8)}...
                              </button>
                            </div>
                          ) : (
                            <span className="text-base-content/50">N/A</span>
                          )}
                        </td>
                        <td>
                          <span className="text-base-content/50">N/A</span>
                        </td>
                        <td>
                          <div
                            className="tooltip"
                            data-tip={new Date(log.startedAt).toLocaleString()}
                          >
                            {new Date(log.startedAt).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </td>
                        <td>
                          <div className="font-mono">
                            {getCallDuration(log.startedAt, log.endedAt)}
                          </div>
                        </td>
                        <td>
                          <div className="dropdown dropdown-left dropdown-hover">
                            <button className="btn btn-square btn-ghost btn-xs">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                className="w-4 h-4 stroke-current"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                                ></path>
                              </svg>
                            </button>
                            <ul className="dropdown-content z-1 menu p-2 shadow-sm bg-base-200 rounded-box w-32">
                              <li>
                                <a>View Details</a>
                              </li>
                              <li>
                                <a>Download Recording</a>
                              </li>
                              <li>
                                <a>View Transcript</a>
                              </li>
                            </ul>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && !error && paginatedLogs.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 bg-base-300">
                <span className="text-base-content/70 pb-4 sm:pb-0">
                  Showing{" "}
                  {Math.min(
                    1 + (currentPage - 1) * logsPerPage,
                    filteredLogs.length
                  )}
                  -{Math.min(currentPage * logsPerPage, filteredLogs.length)} of{" "}
                  {filteredLogs.length} calls
                </span>

                <div className="join">
                  <button
                    className="join-item btn btn-sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    «
                  </button>
                  <button
                    className="join-item btn btn-sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    ‹
                  </button>

                  {getPaginationItems().map((page) => (
                    <button
                      key={page}
                      className={`join-item btn btn-sm ${
                        currentPage === page ? "btn-active" : ""
                      }`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    className="join-item btn btn-sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                    ›
                  </button>
                  <button
                    className="join-item btn btn-sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallLogs;
