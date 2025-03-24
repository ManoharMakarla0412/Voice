"use client";

import { useEffect, useState } from "react";
import { BASE_URL } from "../../utils/constants";

interface APILog {
  id: string;
  time: string;
  resource: string;
  requestDurationSeconds: number;
  requestHttpMethod: string;
  responseHttpCode: number;
}

interface APIResponse {
  results: APILog[];
}

export default function APILogs() {
  const [logs, setLogs] = useState<APILog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/api/logs`);
        if (!response.ok) {
          throw new Error("Failed to fetch logs");
        }
        const data: APIResponse = await response.json();
        setLogs(data.results);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch logs");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      log.time.toLowerCase().includes(searchLower) ||
      log.resource?.toLowerCase().includes(searchLower) ||
      log.requestHttpMethod.toLowerCase().includes(searchLower) ||
      log.responseHttpCode.toString().includes(searchLower) ||
      log.requestDurationSeconds.toString().includes(searchLower)
    );
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage
  );

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
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
                d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"
              ></path>
            </svg>
            API Logs
          </li>
        </ul>
      </div>

      <div className="max-w-[1400px] mx-auto">
        {/* Header Card */}
        <div className="card bg-base-200 shadow-md mb-6">
          <div className="card-body">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <h1 className="card-title text-2xl mb-2">API Request Logs</h1>
                <p className="text-base-content/70">
                  Monitor and analyze your API requests and responses
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
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                  </div>
                  <div className="stat-title">Total Logs</div>
                  <div className="stat-value text-primary">{logs.length}</div>
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
                    placeholder="Search logs..."
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
                    Searching across all fields
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

              {/* Resource dropdown filter could be added here */}
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-outline m-1">
                  Export
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
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                    />
                  </svg>
                </label>
                <ul
                  tabIndex={0}
                  className="dropdown-content z-1 menu p-2 shadow-sm bg-base-200 rounded-box w-52"
                >
                  <li>
                    <a>CSV</a>
                  </li>
                  <li>
                    <a>JSON</a>
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
                    <th className="text-base-content/80 font-semibold">Time</th>
                    <th className="text-base-content/80 font-semibold">
                      Resource
                    </th>
                    <th className="text-base-content/80 font-semibold">
                      Duration (sec)
                    </th>
                    <th className="text-base-content/80 font-semibold">
                      Method
                    </th>
                    <th className="text-base-content/80 font-semibold">
                      Status Code
                    </th>
                    <th className="text-base-content/80 font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center">
                          <span className="loading loading-spinner loading-lg text-primary mb-2"></span>
                          <span className="text-base-content/70">
                            Loading API logs...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12">
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
                      <td colSpan={6} className="text-center py-16">
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
                                d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold text-base-content/70">
                            No logs found
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
                        <td className="font-mono text-xs whitespace-nowrap">
                          {formatDate(log.time)}
                        </td>
                        <td className="capitalize font-medium">
                          {log.resource || "N/A"}
                        </td>
                        <td>
                          <div
                            className="tooltip"
                            data-tip={`${log.requestDurationSeconds * 1000} ms`}
                          >
                            {log.requestDurationSeconds.toFixed(2)}
                          </div>
                        </td>
                        <td>
                          <div
                            className={`
                            badge text-xs font-semibold
                            ${
                              log.requestHttpMethod === "GET"
                                ? "badge-primary"
                                : ""
                            }
                            ${
                              log.requestHttpMethod === "POST"
                                ? "badge-success"
                                : ""
                            }
                            ${
                              log.requestHttpMethod === "PUT"
                                ? "badge-warning"
                                : ""
                            }
                            ${
                              log.requestHttpMethod === "DELETE"
                                ? "badge-error"
                                : ""
                            }
                            ${
                              !["GET", "POST", "PUT", "DELETE"].includes(
                                log.requestHttpMethod
                              )
                                ? "badge-ghost"
                                : ""
                            }
                          `}
                          >
                            {log.requestHttpMethod}
                          </div>
                        </td>
                        <td>
                          <div
                            className="tooltip"
                            data-tip={
                              log.responseHttpCode >= 200 &&
                              log.responseHttpCode < 300
                                ? "Success"
                                : log.responseHttpCode >= 300 &&
                                  log.responseHttpCode < 400
                                ? "Redirection"
                                : log.responseHttpCode >= 400 &&
                                  log.responseHttpCode < 500
                                ? "Client Error"
                                : "Server Error"
                            }
                          >
                            <span
                              className={`badge ${
                                log.responseHttpCode >= 200 &&
                                log.responseHttpCode < 300
                                  ? "badge-success"
                                  : log.responseHttpCode >= 300 &&
                                    log.responseHttpCode < 400
                                  ? "badge-info"
                                  : log.responseHttpCode >= 400 &&
                                    log.responseHttpCode < 500
                                  ? "badge-warning"
                                  : "badge-error"
                              }`}
                            >
                              {log.responseHttpCode}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="dropdown dropdown-left dropdown-hover">
                            <label
                              tabIndex={0}
                              className="btn btn-xs btn-ghost"
                            >
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
                            </label>
                            <ul
                              tabIndex={0}
                              className="dropdown-content z-1 menu p-2 shadow-sm bg-base-200 rounded-box w-32"
                            >
                              <li>
                                <a>View Details</a>
                              </li>
                              <li>
                                <a>Copy ID</a>
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
                  {filteredLogs.length} logs
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
                    onClick={handlePreviousPage}
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
                    onClick={handleNextPage}
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
}
