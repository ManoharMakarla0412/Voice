"use client";

import React, { useState } from "react";
import { useCallData } from "../../hooks/useCallData"; // Adjust path
import {
  PhoneCall,
  Filter,
  Copy,
  X,
  AlertTriangle,
  DollarSign,
  Clock,
  Info,
  User,
  FileAudio,
  MessageSquare,
  ExternalLink,
  Download as DownloadIcon,
  CheckCircle2,
  XCircle,
} from "lucide-react";

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

const CallLogs = () => {
  const { callLogs, logsLoading: loading, logsError: error } = useCallData();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<CallLog | null>(null);
  const [showModal, setShowModal] = useState(false);
  const logsPerPage = 10;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  const filteredLogs = callLogs.filter((log) => {
    const query = searchQuery.toLowerCase();
    return (
      log.callId.toLowerCase().includes(query) ||
      (log.assistantId?.toLowerCase().includes(query) ?? false) ||
      log.type.toLowerCase().includes(query) ||
      log.status.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage
  );

  const getCallDuration = (minutes: number) => {
    if (minutes < 1) return `${Math.round(minutes * 60)} sec`;
    const wholeMinutes = Math.floor(minutes);
    const seconds = Math.round((minutes - wholeMinutes) * 60);
    return `${wholeMinutes}m ${seconds}s`;
  };

  const getPaginationItems = () => {
    const items = [];
    const maxItems = 5;

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

  const handleRowDoubleClick = (log: CallLog) => {
    setSelectedLog(log);
    setShowModal(true);
  };

  const getStatusBadge = (status: string) => {
    if (status === "ended") {
      return (
        <div className="badge badge-success gap-1">
          <CheckCircle2 size={12} />
          Ended
        </div>
      );
    }
    return (
      <div className="badge badge-info gap-1">
        <Info size={12} />
        {status}
      </div>
    );
  };

  function setLogsError(arg0: null): void {
    throw new Error("Function .");
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="card bg-base-300/80 backdrop-blur-xl border-2 border-primary/30 shadow-lg">
          <div className="card-body">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <PhoneCall className="h-6 w-6 text-primary" />
                  Call Logs
                </h1>
                <p className="text-base-content/80 mt-1">
                  Track and analyze your voice assistant interactions
                </p>
              </div>
              <div className="stats bg-base-200/60 shadow-md border border-base-200/30">
                <div className="stat">
                  <div className="flex items-center gap-2">
                    <PhoneCall size={18} className="text-primary" />
                    <div className="stat-title font-medium">Total Calls</div>
                  </div>
                  <div className="stat-value text-primary text-center justify-center">
                    {callLogs.length}
                  </div>
                </div>
                <div className="stat">
                  <div className="flex items-center gap-2">
                    <DollarSign size={18} className="text-success" />
                    <div className="stat-title font-medium">Total Cost</div>
                  </div>
                  <div className="stat-value text-success">
                    {callLogs
                      .reduce((sum, log) => sum + log.cost, 0)
                      .toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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
                    placeholder="Search calls..."
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

              <div className="dropdown dropdown-top z-50">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-outline m-1 shadow-md"
                >
                  <Filter size={16} />
                  Filter by type
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content z-[100] menu p-2 shadow-lg bg-base-300/90 backdrop-blur-xl border border-base-200/40 rounded-box w-52"
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

        {error && (
          <div className="alert alert-error shadow-lg border border-error/30">
            <AlertTriangle size={18} />
            <div>
              <h3 className="font-bold">Error</h3>
              <div className="text-xs">{error}</div>
            </div>
            <button
              className="btn btn-sm btn-circle btn-ghost ml-auto"
              onClick={() => setLogsError(null)}
            >
              <X size={16} />
            </button>
          </div>
        )}

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
                      Type
                    </th>
                    <th className="text-base-content/90 font-semibold text-center">
                      Call ID
                    </th>
                    <th className="text-base-content/90 font-semibold text-center">
                      Cost
                    </th>
                    <th className="text-base-content/90 font-semibold text-center">
                      Status
                    </th>
                    <th className="text-base-content/90 font-semibold text-center">
                      Assistant
                    </th>
                    <th className="text-base-content/90 font-semibold text-center">
                      Phone Number
                    </th>
                    <th className="text-base-content/90 font-semibold text-center">
                      Start Time
                    </th>
                    <th className="text-base-content/90 font-semibold text-center">
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center">
                          <span className="loading loading-spinner loading-lg text-primary mb-2"></span>
                          <span className="text-base-content/70">
                            Loading call logs...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedLogs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-16">
                        <div className="flex flex-col items-center justify-center">
                          <div className="avatar avatar-placeholder mb-4">
                            <div className="bg-primary/10 text-primary rounded-full w-24 h-24 flex items-center justify-center">
                              <PhoneCall size={36} className="opacity-50" />
                              <X size={28} className="absolute opacity-70" />
                            </div>
                          </div>
                          <h3 className="text-lg font-semibold text-base-content/80">
                            No call logs found
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
                        key={log.callId}
                        className="hover backdrop-blur-sm cursor-pointer"
                        onDoubleClick={() => handleRowDoubleClick(log)}
                      >
                        <td>
                          <div
                            className={`
                              badge shadow-sm
                              ${log.type === "webCall" ? "badge-info" : ""}
                              ${
                                log.type === "inboundPhoneCall"
                                  ? "badge-success"
                                  : ""
                              }
                              ${
                                log.type === "outboundPhoneCall"
                                  ? "badge-warning"
                                  : ""
                              }
                              ${
                                ![
                                  "webCall",
                                  "inboundPhoneCall",
                                  "outboundPhoneCall",
                                ].includes(log.type)
                                  ? "badge-ghost"
                                  : ""
                              }
                            `}
                          >
                            {log.type === "webCall"
                              ? "Web"
                              : log.type === "inboundPhoneCall"
                              ? "Inbound"
                              : log.type === "outboundPhoneCall"
                              ? "Outbound"
                              : log.type}
                          </div>
                        </td>
                        <td className="font-mono text-xs">
                          <div className="flex items-center gap-2">
                            <span className="truncate max-w-[100px]">
                              {log.callId}
                            </span>
                            <div className="tooltip" data-tip="Copy ID">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(log.callId);
                                }}
                                className="btn btn-ghost btn-xs"
                              >
                                {copied === log.callId ? (
                                  <span className="text-success text-xs flex items-center">
                                    Copied!
                                  </span>
                                ) : (
                                  <Copy size={14} />
                                )}
                              </button>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="font-mono text-success">
                            ${log.cost.toFixed(2)}
                          </div>
                        </td>
                        <td>{getStatusBadge(log.status)}</td>
                        <td>
                          {log.assistantId ? (
                            <div className="tooltip" data-tip={log.assistantId}>
                              <button className="btn btn-ghost btn-xs btn-outline bg-base-200/40">
                                {log.assistantId.substring(0, 8)}...
                              </button>
                            </div>
                          ) : (
                            <span className="text-base-content/50">N/A</span>
                          )}
                        </td>
                        <td>
                          {log.customerNumber || (
                            <span className="text-base-content/60">N/A</span>
                          )}
                        </td>
                        <td>
                          <div
                            className="tooltip"
                            data-tip={new Date(log.startedAt).toLocaleString()}
                          >
                            <div className="flex items-center gap-1">
                              <Clock
                                size={14}
                                className="text-base-content/60"
                              />
                              {new Date(log.startedAt).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="font-mono badge badge-ghost badge-sm text-nowrap">
                            {getCallDuration(log.minutes)}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {!loading && paginatedLogs.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 bg-primary/10">
                <span className="text-base-content/70 pb-4 sm:pb-0">
                  Showing{" "}
                  {Math.min(
                    1 + (currentPage - 1) * logsPerPage,
                    filteredLogs.length
                  )}
                  -{Math.min(currentPage * logsPerPage, filteredLogs.length)} of{" "}
                  {filteredLogs.length} calls
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

      {showModal && selectedLog && (
        <dialog open className="modal">
          <div className="modal-box bg-base-300/95 backdrop-blur-xl border-2 border-primary/30 shadow-xl max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PhoneCall className="text-primary" size={18} />
                <h2 className="font-bold text-lg">
                  <div className="flex items-center gap-2">
                    <div
                      className={`
                        badge badge-sm shadow-sm
                        ${selectedLog.type === "webCall" ? "badge-info" : ""}
                        ${
                          selectedLog.type === "inboundPhoneCall"
                            ? "badge-success"
                            : ""
                        }
                        ${
                          selectedLog.type === "outboundPhoneCall"
                            ? "badge-warning"
                            : ""
                        }
                        ${
                          ![
                            "webCall",
                            "inboundPhoneCall",
                            "outboundPhoneCall",
                          ].includes(selectedLog.type)
                            ? "badge-ghost"
                            : ""
                        }
                      `}
                    >
                      {selectedLog.type === "webCall"
                        ? "Web"
                        : selectedLog.type === "inboundPhoneCall"
                        ? "Inbound"
                        : selectedLog.type === "outboundPhoneCall"
                        ? "Outbound"
                        : selectedLog.type}
                    </div>
                    Call Details
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

            <div className="space-y-4">
              <div className="card bg-base-200/30 shadow-sm">
                <div className="card-body p-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex flex-col">
                      <span className="text-xs text-base-content/70">
                        Duration
                      </span>
                      <div className="font-medium flex items-center">
                        <Clock
                          size={12}
                          className="mr-1 text-base-content/70"
                        />
                        {getCallDuration(selectedLog.minutes)}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-base-content/70">
                        Start Time
                      </span>
                      <div className="font-medium">
                        {new Date(selectedLog.startedAt).toLocaleDateString()}{" "}
                        <span className="text-xs opacity-70">
                          {new Date(selectedLog.startedAt).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-base-content/70">Cost</span>
                      <div className="font-medium text-success">
                        ${selectedLog.cost.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-base-300/50">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-base-content/70">
                        Status
                      </span>
                      <span
                        className={
                          selectedLog.status === "ended"
                            ? "font-medium text-success"
                            : "font-medium text-info"
                        }
                      >
                        {selectedLog.status}
                      </span>
                    </div>
                    <div className="w-full bg-base-100/30 h-2 rounded-full mt-2 overflow-hidden">
                      <div
                        className={
                          selectedLog.status === "ended"
                            ? "h-full bg-success"
                            : "h-full bg-info"
                        }
                        style={{ width: "100%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card bg-base-200/30 shadow-sm">
                <div className="card-body p-3">
                  <h3 className="text-sm font-medium mb-2">
                    Technical Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-base-100/20 p-2 rounded-lg">
                      <div className="text-xs text-base-content/70 flex items-center gap-1 mb-1">
                        <Info size={12} />
                        Call ID
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="font-mono text-xs truncate max-w-[85%]">
                          {selectedLog.callId}
                        </div>
                        <div
                          className="tooltip tooltip-left"
                          data-tip="Copy to clipboard"
                        >
                          <button
                            onClick={() => copyToClipboard(selectedLog.callId)}
                            className="btn btn-ghost btn-xs h-6 min-h-0 px-1"
                          >
                            {copied === selectedLog.callId ? (
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
                    <div className="bg-base-100/20 p-2 rounded-lg">
                      <div className="text-xs text-base-content/70 flex items-center gap-1 mb-1">
                        <User size={12} />
                        Assistant
                      </div>
                      <div className="flex items-center justify-between">
                        {selectedLog.assistantId ? (
                          <>
                            <div className="font-mono text-xs truncate max-w-[85%]">
                              {selectedLog.assistantId}
                            </div>
                            <div
                              className="tooltip tooltip-left"
                              data-tip="View details"
                            >
                              <button className="btn btn-ghost btn-xs h-6 min-h-0 px-1">
                                <ExternalLink size={14} />
                              </button>
                            </div>
                          </>
                        ) : (
                          <span className="text-base-content/50">
                            Not available
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card bg-base-200/30 shadow-sm">
                <div className="card-body p-3">
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <Clock size={12} />
                    Call Timeline
                  </h3>
                  <ul className="timeline timeline-vertical timeline-compact timeline-snap-icon">
                    <li>
                      <div className="timeline-middle">
                        <div className="badge badge-xs badge-primary"></div>
                      </div>
                      <div className="timeline-start text-xs text-right mr-4">
                        {new Date(selectedLog.startedAt).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </div>
                      <div className="timeline-end text-xs ml-4">
                        <span className="font-medium">Call Started</span>
                      </div>
                    </li>
                    <li>
                      <div className="timeline-middle">
                        <div className="badge badge-xs badge-secondary"></div>
                      </div>
                      <div className="timeline-start text-xs text-right mr-4">
                        {new Date(selectedLog.endedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="timeline-end text-xs ml-4">
                        <span className="font-medium">Call Ended</span>
                        <div className="text-2xs opacity-70">
                          {selectedLog.status}
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="card bg-base-200/30 shadow-sm">
                <div className="card-body p-3">
                  <h3 className="text-sm font-medium mb-2">
                    Available Actions
                  </h3>
                  <div className="join join-horizontal w-full">
                    <button className="join-item btn btn-sm flex-1">
                      <FileAudio size={14} />
                      Recording
                    </button>
                    <button className="join-item btn btn-sm flex-1">
                      <MessageSquare size={14} />
                      Transcript
                    </button>
                    <button className="join-item btn btn-sm flex-1">
                      <DownloadIcon size={14} />
                      Export
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
};

export default CallLogs;