"use client";

import { useEffect, useState } from "react";
import { BASE_URL } from "../../utils/constants";
import {
  Search,
  FileDown,
  Home,
  Code,
  Clock,
  ArrowLeft,
  ArrowRight,
  Info,
  X,
  ChevronDown,
  MoreVertical,
  AlertTriangle,
  Copy,
  Eye,
  Database,
  CheckCircle2,
  ExternalLink,
  Download,
  FileJson,
  Terminal,
  Server,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

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
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<APILog | null>(null);
  const [showModal, setShowModal] = useState(false);
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

  // Copy to clipboard with visual feedback
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage
  );

  // Handle double click on a row
  const handleRowDoubleClick = (log: APILog) => {
    setSelectedLog(log);
    setShowModal(true);
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
    <div className="p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header with title */}
        <div className="card bg-base-300/80 backdrop-blur-xl border-2 border-primary/30 shadow-lg">
          <div className="card-body">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Database className="h-6 w-6 text-primary" />
                  API Request Logs
                </h1>
                <p className="text-base-content/80 mt-1">
                  Monitor and analyze your API requests and responses
                </p>
              </div>

              {/* Improved Stats */}
              <div className="stats bg-base-200/60 shadow-md border border-base-200/30">
                <div className="stat">
                  <div className="flex items-center gap-2">
                    <Database size={18} className="text-primary" />
                    <div className="stat-title font-medium">Total Logs</div>
                  </div>
                  <div className="stat-value text-primary text-center">{logs.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card bg-base-300/80 backdrop-blur-xl border-2 border-primary/30 shadow-lg">
          <div className="card-body">
            <div className="flex flex-wrap items-center gap-4">
              <div className="form-control grow max-w-md">
                <label className="input shadow-md bg-base-100/60 backdrop-blur-md flex items-center gap-2 px-3">
                  <svg
                    className="h-5 w-5 opacity-50"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <g
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      strokeWidth="2"
                      fill="none"
                      stroke="currentColor"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.3-4.3"></path>
                    </g>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search across all fields..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="grow bg-transparent border-none focus:outline-none w-full"
                  />
                  {searchQuery && (
                    <button
                      className="btn btn-ghost btn-sm px-2"
                      onClick={() => setSearchQuery("")}
                    >
                      <X size={16} />
                    </button>
                  )}
                </label>
              </div>

              <div className="grow"></div>

              {/* Export dropdown with fixed z-index */}
              <div className="dropdown dropdown-top z-50">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-outline m-1 shadow-md"
                >
                  <FileDown size={16} />
                  Export
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content z-[100] menu p-2 shadow-lg bg-base-300/90 backdrop-blur-xl border border-base-200/40 rounded-box w-52"
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

        {/* Error display */}
        {error && (
          <div className="alert alert-error shadow-lg border border-error/30">
            <AlertTriangle size={18} />
            <div>
              <h3 className="font-bold">Error</h3>
              <div className="text-xs">{error}</div>
            </div>
            <button
              className="btn btn-sm btn-circle btn-ghost ml-auto"
              onClick={() => setError(null)}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Table Card */}
        <div className="card bg-base-300/80 backdrop-blur-xl border-2 border-primary/30 shadow-lg overflow-hidden">
          <div className="card-body p-0">
            <div className="alert alert-info bg-info/10 border-info/30 rounded-none">
              <Info size={18} />
              <span>Double-click on any row to view detailed information</span>
            </div>

            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr className="bg-primary/20">
                    <th className="text-base-content/90 font-semibold text-center">
                      Time
                    </th>
                    <th className="text-base-content/90 font-semibold text-center">
                      Resource
                    </th>
                    <th className="text-base-content/90 font-semibold text-center">
                      Duration (sec)
                    </th>
                    <th className="text-base-content/90 font-semibold text-center">
                      Method
                    </th>
                    <th className="text-base-content/90 font-semibold text-center">
                      Status Code
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center">
                          <span className="loading loading-spinner loading-lg text-primary mb-2"></span>
                          <span className="text-base-content/70">
                            Loading API logs...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-16">
                        <div className="flex flex-col items-center justify-center">
                          <div className="avatar placeholder mb-4">
                            <div className="bg-primary/10 text-primary rounded-full w-24 h-24 flex items-center justify-center">
                              <Database size={36} className="opacity-50" />
                              <X size={28} className="absolute opacity-70" />
                            </div>
                          </div>
                          <h3 className="text-lg font-semibold text-base-content/80">
                            No API logs found
                          </h3>
                          {searchQuery && (
                            <button
                              className="btn btn-sm btn-ghost btn-outline mt-4"
                              onClick={() => setSearchQuery("")}
                            >
                              <X size={14} className="mr-1" />
                              Clear search filters
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedLogs.map((log) => (
                      <tr
                        key={log.id}
                        className="hover backdrop-blur-sm cursor-pointer"
                        onDoubleClick={() => handleRowDoubleClick(log)}
                      >
                        <td className="font-mono text-xs whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Clock size={14} className="text-base-content/60" />
                            {formatDate(log.time)}
                          </div>
                        </td>
                        <td className="capitalize font-medium text-center">
                          {log.resource || "N/A"}
                        </td>
                        <td className="text-center">
                          <div
                            className="tooltip flex justify-center"
                            data-tip={`${log.requestDurationSeconds * 1000} ms`}
                          >
                            <span className="font-mono badge badge-ghost badge-sm">
                              {log.requestDurationSeconds.toFixed(2)}
                            </span>
                          </div>
                        </td>
                        <td className="text-center">
                          <div className="flex justify-center">
                            <div
                              className={`
                                badge shadow-sm
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
                          </div>
                        </td>
                        <td className="text-center">
                          <span
                            className={`
                              ${
                                log.responseHttpCode >= 200 &&
                                log.responseHttpCode < 300
                                  ? "text-success"
                                  : ""
                              }
                              ${
                                log.responseHttpCode >= 300 &&
                                log.responseHttpCode < 400
                                  ? "text-info"
                                  : ""
                              }
                              ${
                                log.responseHttpCode >= 400 &&
                                log.responseHttpCode < 500
                                  ? "text-warning"
                                  : ""
                              }
                              ${log.responseHttpCode >= 500 ? "text-error" : ""}
                              font-medium
                            `}
                          >
                            {log.responseHttpCode}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && paginatedLogs.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 bg-primary/10">
                <span className="text-base-content/70 pb-4 sm:pb-0">
                  Showing{" "}
                  {Math.min(
                    1 + (currentPage - 1) * logsPerPage,
                    filteredLogs.length
                  )}
                  -{Math.min(currentPage * logsPerPage, filteredLogs.length)} of{" "}
                  {filteredLogs.length} logs
                </span>

                <div className="join shadow-md">
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
                        currentPage === page ? "btn-primary" : ""
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

      {/* API Log Details Modal */}
      {showModal && selectedLog && (
        <dialog open className="modal">
          <div className="modal-box bg-base-300/95 backdrop-blur-xl border-2 border-primary/30 shadow-xl max-w-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Server className="text-primary" size={18} />
                <h2 className="font-bold text-lg">
                  <div className="flex items-center gap-2">
                    <div
                      className={`
                        badge badge-sm shadow-sm
                        ${
                          selectedLog.requestHttpMethod === "GET"
                            ? "badge-primary"
                            : ""
                        }
                        ${
                          selectedLog.requestHttpMethod === "POST"
                            ? "badge-success"
                            : ""
                        }
                        ${
                          selectedLog.requestHttpMethod === "PUT"
                            ? "badge-warning"
                            : ""
                        }
                        ${
                          selectedLog.requestHttpMethod === "DELETE"
                            ? "badge-error"
                            : ""
                        }
                        ${
                          !["GET", "POST", "PUT", "DELETE"].includes(
                            selectedLog.requestHttpMethod
                          )
                            ? "badge-ghost"
                            : ""
                        }
                      `}
                    >
                      {selectedLog.requestHttpMethod}
                    </div>
                    API Request Details
                  </div>
                </h2>
              </div>
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => {
                  setShowModal(false);
                  setSelectedLog(null);
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Main Content */}
            <div className="space-y-4">
              {/* Summary Card */}
              <div className="card bg-base-200/30 shadow-sm">
                <div className="card-body p-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Resource */}
                    <div className="flex flex-col">
                      <span className="text-xs text-base-content/70">
                        Resource
                      </span>
                      <div className="font-medium flex items-center">
                        <ArrowUpRight
                          size={12}
                          className="mr-1 text-base-content/70"
                        />
                        {selectedLog.resource || "N/A"}
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div className="flex flex-col">
                      <span className="text-xs text-base-content/70">
                        Timestamp
                      </span>
                      <div className="font-medium">
                        {new Date(selectedLog.time).toLocaleDateString()}{" "}
                        <span className="text-xs opacity-70">
                          {new Date(selectedLog.time).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="flex flex-col">
                      <span className="text-xs text-base-content/70">
                        Duration
                      </span>
                      <div className="font-medium">
                        {selectedLog.requestDurationSeconds.toFixed(2)}s
                        <span className="text-xs opacity-70 ml-1">
                          (
                          {(selectedLog.requestDurationSeconds * 1000).toFixed(
                            0
                          )}{" "}
                          ms)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status - Full width */}
                  <div className="mt-3 pt-3 border-t border-base-300/50">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-base-content/70">
                        Status Code
                      </span>
                      <span
                        className={`
                          font-medium 
                          ${
                            selectedLog.responseHttpCode >= 200 &&
                            selectedLog.responseHttpCode < 300
                              ? "text-success"
                              : ""
                          }
                          ${
                            selectedLog.responseHttpCode >= 300 &&
                            selectedLog.responseHttpCode < 400
                              ? "text-info"
                              : ""
                          }
                          ${
                            selectedLog.responseHttpCode >= 400 &&
                            selectedLog.responseHttpCode < 500
                              ? "text-warning"
                              : ""
                          }
                          ${
                            selectedLog.responseHttpCode >= 500
                              ? "text-error"
                              : ""
                          }
                        `}
                      >
                        {selectedLog.responseHttpCode} -{" "}
                        {selectedLog.responseHttpCode >= 200 &&
                        selectedLog.responseHttpCode < 300
                          ? "Success"
                          : selectedLog.responseHttpCode >= 300 &&
                            selectedLog.responseHttpCode < 400
                          ? "Redirection"
                          : selectedLog.responseHttpCode >= 400 &&
                            selectedLog.responseHttpCode < 500
                          ? "Client Error"
                          : "Server Error"}
                      </span>
                    </div>
                    <div className="w-full bg-base-100/30 h-2 rounded-full mt-2 overflow-hidden">
                      <div
                        className={`h-full 
                          ${
                            selectedLog.responseHttpCode >= 200 &&
                            selectedLog.responseHttpCode < 300
                              ? "bg-success"
                              : ""
                          }
                          ${
                            selectedLog.responseHttpCode >= 300 &&
                            selectedLog.responseHttpCode < 400
                              ? "bg-info"
                              : ""
                          }
                          ${
                            selectedLog.responseHttpCode >= 400 &&
                            selectedLog.responseHttpCode < 500
                              ? "bg-warning"
                              : ""
                          }
                          ${
                            selectedLog.responseHttpCode >= 500
                              ? "bg-error"
                              : ""
                          }
                        `}
                        style={{ width: "100%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Details */}
              <div className="card bg-base-200/30 shadow-sm">
                <div className="card-body p-3">
                  <h3 className="text-sm font-medium mb-2">
                    Technical Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Request ID */}
                    <div className="bg-base-100/20 p-2 rounded-lg">
                      <div className="text-xs text-base-content/70 flex items-center gap-1 mb-1">
                        <Info size={12} />
                        Request ID
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="font-mono text-xs truncate max-w-[85%]">
                          {selectedLog.id}
                        </div>
                        <div
                          className="tooltip tooltip-left"
                          data-tip="Copy to clipboard"
                        >
                          <button
                            onClick={() => copyToClipboard(selectedLog.id)}
                            className="btn btn-ghost btn-xs h-6 min-h-0 px-1"
                          >
                            {copied === selectedLog.id ? (
                              <CheckCircle2
                                size={14}
                                className="text-success"
                              />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Method and Resource */}
                    <div className="bg-base-100/20 p-2 rounded-lg">
                      <div className="text-xs text-base-content/70 flex items-center gap-1 mb-1">
                        <Terminal size={12} />
                        Request Details
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="font-mono text-xs">
                          {selectedLog.requestHttpMethod} {selectedLog.resource}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="card bg-base-200/30 shadow-sm">
                <div className="card-body p-3">
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <Clock size={12} />
                    Request Timeline
                  </h3>

                  <ul className="timeline timeline-vertical timeline-compact timeline-snap-icon">
                    <li>
                      <div className="timeline-middle">
                        <div className="badge badge-xs badge-primary"></div>
                      </div>
                      <div className="timeline-start text-xs text-right mr-4">
                        {new Date(selectedLog.time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </div>
                      <div className="timeline-end text-xs ml-4">
                        <span className="font-medium">Request Started</span>
                      </div>
                    </li>
                    <li>
                      <div className="timeline-middle">
                        <div className="badge badge-xs badge-secondary"></div>
                      </div>
                      <div className="timeline-start text-xs text-right mr-4">
                        {new Date(
                          new Date(selectedLog.time).getTime() +
                            selectedLog.requestDurationSeconds * 1000
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </div>
                      <div className="timeline-end text-xs ml-4">
                        <span className="font-medium">Request Completed</span>
                        <div className="text-2xs opacity-70">
                          {selectedLog.responseHttpCode} status code
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Actions */}
              <div className="card bg-base-200/30 shadow-sm">
                <div className="card-body p-3">
                  <h3 className="text-sm font-medium mb-2">
                    Available Actions
                  </h3>
                  <div className="join join-horizontal w-full">
                    <button className="join-item btn btn-sm flex-1">
                      <FileJson size={14} />
                      View JSON
                    </button>
                    <button className="join-item btn btn-sm flex-1">
                      <Terminal size={14} />
                      View Headers
                    </button>
                    <button className="join-item btn btn-sm flex-1">
                      <Download size={14} />
                      Export
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal backdrop */}
          <form
            method="dialog"
            className="modal-backdrop"
            onClick={() => {
              setShowModal(false);
              setSelectedLog(null);
            }}
          >
            <button>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}
