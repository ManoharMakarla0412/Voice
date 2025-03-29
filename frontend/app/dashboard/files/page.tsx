"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FileIcon,
  Link,
  Plus,
  Trash,
  Upload,
  LayoutGrid,
  List,
  X,
  AlertTriangle,
  Check,
  FileText,
  RefreshCw,
  Search,
  Database,
  Filter,
  Clock,
  Copy,
  Download,
  FileAudio,
  Info,
  ExternalLink,
} from "lucide-react";
import { BASE_URL } from "../../utils/constants";

interface PDF {
  _id: string;
  name: string;
  url: string;
  createdAt: string;
}

export default function FilesPage() {
  // State declarations
  const [pdfName, setPdfName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showUploadArea, setShowUploadArea] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPdfs();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
        setPdfName(selectedFile.name);
      } else {
        showToast("Please select a PDF file", "error");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
        setPdfName(droppedFile.name);
      } else {
        showToast("Please drop a PDF file", "error");
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const showToast = (
    message: string,
    type: "success" | "error" | "warning" | "info"
  ) => {
    const toast = document.createElement("div");
    toast.className = "toast toast-top toast-end";

    const alert = document.createElement("div");
    alert.className = `alert alert-${type} py-2`;
    alert.innerHTML = `<span>${message}</span>`;

    toast.appendChild(alert);
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  const handleUpload = async () => {
    if (!file) {
      showToast("Please select a file", "warning");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${BASE_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Upload failed");
      }

      await response.json();
      showToast("File uploaded successfully", "success");
      fetchPdfs();

      // Reset form
      setFile(null);
      setPdfName("");
      setShowUploadArea(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to upload file",
        "error"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const fetchPdfs = async () => {
    setIsFetching(true);
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/api/pdfs`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch PDFs");
      }

      const data = await response.json();
      setPdfs(data);
      return data;
    } catch (error) {
      console.error("Error fetching PDFs:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch PDFs");
      return [];
    } finally {
      setIsFetching(false);
    }
  };

  const deletePdf = async (id: string) => {
    try {
      const response = await fetch(`/api/uploads/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete PDF");
      }

      showToast("PDF deleted successfully", "success");
      fetchPdfs(); // Refresh the list after deletion
    } catch (error) {
      console.error("Error deleting PDF:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to delete PDF",
        "error"
      );
    }
  };

  // Filter PDFs based on search query
  const filteredPdfs = pdfs.filter((pdf) => {
    const query = searchQuery.toLowerCase();
    return (
      pdf.name.toLowerCase().includes(query) ||
      (pdf.url.split("/").pop() || "").toLowerCase().includes(query)
    );
  });

  // Format file size for display
  const formatFileSize = (size: number): string => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {filteredPdfs.map((pdf) => (
        <div
          key={pdf._id}
          className="card bg-base-100/60 backdrop-blur-md border-2 border-primary/30 hover:border-primary/60 shadow-md transition-all"
        >
          <div className="card-body p-4">
            <div className="flex items-center justify-center h-32 bg-primary/10 backdrop-blur-sm rounded-lg mb-3 shadow-inner">
              <div className="relative flex flex-col items-center justify-center">
                <FileText size={48} className="text-primary opacity-80" />
                <div className="absolute bottom-0 text-xs bg-primary text-primary-content px-2 py-0.5 rounded font-medium">
                  PDF
                </div>
              </div>
            </div>

            <h2
              className="card-title text-sm font-medium line-clamp-1"
              title={pdf.name}
            >
              {pdf.name || pdf.url.split("/").pop() || "Unnamed PDF"}
            </h2>

            <p className="text-xs text-base-content/70">
              Added {new Date(pdf.createdAt).toLocaleDateString()} •{" "}
              {formatFileSize(12500)}
            </p>

            <div className="card-actions justify-end mt-3 pt-2 border-t border-base-200/30">
              <a
                href={pdf.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm"
              >
                <ExternalLink size={16} />
                Open
              </a>
              <button
                onClick={() => deletePdf(pdf._id)}
                className="btn btn-error btn-sm"
              >
                <Trash size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="overflow-x-auto">
      <table className="table table-zebra w-full">
        <thead>
          <tr className="bg-primary/20">
            <th className="text-base-content/90 font-semibold text-center">
              Name
            </th>
            <th className="text-base-content/90 font-semibold text-center">
              Added
            </th>
            <th className="text-base-content/90 font-semibold text-center">
              Size
            </th>
            <th className="text-base-content/90 font-semibold text-center">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredPdfs.map((pdf) => (
            <tr key={pdf._id} className="hover backdrop-blur-sm">
              <td className="flex items-center gap-2 justify-center">
                <div className="p-2 rounded-md bg-primary/10">
                  <FileText size={18} className="text-primary" />
                </div>
                <div className="font-medium line-clamp-1" title={pdf.name}>
                  {pdf.name || pdf.url.split("/").pop() || "Unnamed PDF"}
                </div>
              </td>
              <td className="text-sm text-center">
                <div className="flex items-center gap-1 justify-center">
                  <Clock size={14} className="text-base-content/60" />
                  {new Date(pdf.createdAt).toLocaleDateString()}
                </div>
              </td>
              <td className="text-sm text-center">{formatFileSize(12500)}</td>
              <td className="text-center">
                <div className="flex gap-2 justify-center">
                  <a
                    href={pdf.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-xs"
                  >
                    <ExternalLink size={14} />
                    Open
                  </a>
                  <button
                    onClick={() => deletePdf(pdf._id)}
                    className="btn btn-error btn-xs"
                  >
                    <Trash size={14} />
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Render the component
  return (
    <div className="p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header with title and stats - Styled like Call Logs page */}
        <div className="card bg-base-300/80 backdrop-blur-xl border-2 border-primary/30 shadow-lg">
          <div className="card-body">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Database className="h-6 w-6 text-primary" />
                  Knowledge Base
                </h1>
                <p className="text-base-content/80 mt-1">
                  Upload and manage your reference documents
                </p>
              </div>

              {/* Improved Stats */}
              <div className="stats bg-base-200/60 shadow-md border border-base-200/30">
                <div className="stat">
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-primary" />
                    <div className="stat-title font-medium">Total Files</div>
                  </div>
                  <div className="stat-value text-primary text-center">{pdfs.length}</div>
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
                    placeholder="Search documents..."
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

              <div className="join mr-2 shadow-sm">
                <button
                  className={`join-item btn btn-sm ${
                    viewMode === "grid" ? "btn-primary" : "btn-ghost"
                  }`}
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  className={`join-item btn btn-sm ${
                    viewMode === "list" ? "btn-primary" : "btn-ghost"
                  }`}
                  onClick={() => setViewMode("list")}
                >
                  <List size={16} />
                </button>
              </div>

              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowUploadArea(true)}
              >
                <Upload size={16} />
                Upload PDF
              </button>

              <button
                className="btn btn-outline btn-sm"
                onClick={fetchPdfs}
                disabled={isFetching}
              >
                {isFetching ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <>
                    <RefreshCw size={16} />
                    Refresh
                  </>
                )}
              </button>
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

        {/* Files list */}
        <div className="card bg-base-300/80 backdrop-blur-xl border-2 border-primary/30 shadow-lg overflow-hidden">
          <div className="card-body p-0">
            <div className="alert alert-info bg-info/10 border-info/30 rounded-none">
              <Info size={18} />
              <span>Click on Open to view the document in a new tab</span>
            </div>

            {isFetching && pdfs.length === 0 ? (
              <div className="flex justify-center items-center p-16">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            ) : filteredPdfs.length > 0 ? (
              <div className="">
                {/* View mode content */}
                {viewMode === "grid" ? renderGridView() : renderListView()}
              </div>
            ) : (
              <div className="card-body items-center text-center py-16">
                <div className="avatar">
                  <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center shadow-md">
                    <FileIcon className="w-12 h-12 text-primary" />
                  </div>
                </div>
                <h2 className="card-title text-2xl mt-6 mb-2">
                  {searchQuery ? "No Matching Documents" : "No Documents Yet"}
                </h2>
                <p className="text-base-content/70 max-w-md mb-8">
                  {searchQuery
                    ? "Try adjusting your search term or clear the search to see all documents."
                    : "Your knowledge base is empty. Upload PDF documents to train your assistants with specific information."}
                </p>
                {searchQuery ? (
                  <button
                    className="btn btn-ghost"
                    onClick={() => setSearchQuery("")}
                  >
                    <X size={20} className="mr-2" />
                    Clear Search
                  </button>
                ) : (
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={() => setShowUploadArea(true)}
                  >
                    <Upload size={20} />
                    Upload Your First PDF
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal - Redesigned to match our modal style */}
      {showUploadArea && (
        <dialog open className="modal">
          <div className="modal-box bg-base-300/95 backdrop-blur-xl border-2 border-primary/30 shadow-xl max-w-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Upload className="text-primary" size={18} />
                <h2 className="font-bold text-lg">Upload PDF Document</h2>
              </div>
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => {
                  setShowUploadArea(false);
                  setFile(null);
                  setPdfName("");
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <div className="card bg-base-200/30 shadow-sm">
                <div className="card-body p-4">
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                      isDragging
                        ? "border-primary bg-primary/10 shadow-inner"
                        : "border-base-content/20 hover:border-base-content/40"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className="avatar avatar-placeholder">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center shadow-inner">
                          <FileIcon className="w-8 h-8 text-primary" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="font-medium">
                          {file ? (
                            <span className="text-success flex items-center gap-2 justify-center">
                              <Check size={16} />
                              {pdfName}
                            </span>
                          ) : (
                            "Drag & drop PDF here or click to browse"
                          )}
                        </p>

                        <p className="text-xs text-base-content/70">
                          Supported file type: PDF only
                        </p>

                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept=".pdf"
                          className="hidden"
                        />

                        <button
                          className="btn btn-sm mt-2"
                          onClick={triggerFileInput}
                        >
                          <Plus size={14} />
                          Browse Files
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {file && (
                <div className="card bg-base-200/30 shadow-sm">
                  <div className="card-body p-3">
                    <h3 className="text-sm font-medium mb-2">File Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-base-100/20 p-2 rounded-lg">
                        <div className="text-xs text-base-content/70 flex items-center gap-1 mb-1">
                          <Info size={12} />
                          File Name
                        </div>
                        <div className="font-medium text-sm truncate">
                          {pdfName}
                        </div>
                      </div>

                      <div className="bg-base-100/20 p-2 rounded-lg">
                        <div className="text-xs text-base-content/70 flex items-center gap-1 mb-1">
                          <Database size={12} />
                          File Size
                        </div>
                        <div className="font-medium text-sm">
                          {formatFileSize(file.size)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end border-t border-base-200/30 pt-4 mt-4">
              <button
                className="btn btn-ghost btn-sm mr-2"
                onClick={() => {
                  setShowUploadArea(false);
                  setFile(null);
                  setPdfName("");
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleUpload}
                disabled={!file || isUploading}
              >
                {isUploading ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Upload PDF
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Modal backdrop */}
          <form
            method="dialog"
            className="modal-backdrop"
            onClick={() => {
              setShowUploadArea(false);
              setFile(null);
              setPdfName("");
            }}
          >
            <button>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}
