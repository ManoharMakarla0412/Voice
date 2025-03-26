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

  // Format file size for display
  const formatFileSize = (size: number): string => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {pdfs.map((pdf) => (
        <div
          key={pdf._id}
          className="card bg-base-200 shadow-md hover:shadow-lg transition-all"
        >
          <div className="card-body p-4">
            <div className="flex items-center justify-center h-32 bg-base-300 rounded-lg mb-3">
              <div className="relative flex flex-col items-center justify-center">
                <FileText size={48} className="text-primary opacity-70" />
                <div className="absolute bottom-0 text-xs bg-primary text-primary-content px-1 rounded">
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

            <div className="card-actions justify-end mt-2">
              <a
                href={pdf.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-xs"
              >
                <Link size={14} />
                Open
              </a>
              <button
                onClick={() => deletePdf(pdf._id)}
                className="btn btn-error btn-xs btn-outline"
              >
                <Trash size={14} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="overflow-x-auto">
      <table className="table table-zebra">
        <thead>
          <tr>
            <th>Name</th>
            <th>Added</th>
            <th>Size</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {pdfs.map((pdf) => (
            <tr key={pdf._id} className="hover">
              <td className="flex items-center gap-2">
                <FileText size={18} className="text-primary" />
                <div className="font-medium line-clamp-1" title={pdf.name}>
                  {pdf.name || pdf.url.split("/").pop() || "Unnamed PDF"}
                </div>
              </td>
              <td className="text-sm text-base-content/70">
                {new Date(pdf.createdAt).toLocaleDateString()}
              </td>
              <td className="text-sm text-base-content/70">
                {formatFileSize(12500)}
              </td>
              <td>
                <div className="flex gap-2">
                  <a
                    href={pdf.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-xs"
                  >
                    <Link size={14} />
                    Open
                  </a>
                  <button
                    onClick={() => deletePdf(pdf._id)}
                    className="btn btn-error btn-xs btn-outline"
                  >
                    <Trash size={14} />
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
    <div className="min-h-screen bg-base-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Knowledge Base</h1>
            <p className="text-base-content/70">
              Upload and manage your reference documents
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <div className="join">
              <button
                className={`join-item btn btn-sm ${
                  viewMode === "grid" ? "btn-active" : ""
                }`}
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                className={`join-item btn btn-sm ${
                  viewMode === "list" ? "btn-active" : ""
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
                "Refresh"
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertTriangle size={16} />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="btn btn-ghost btn-xs"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {showUploadArea && (
          <div className="card bg-base-200">
            <div className="card-body p-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="card-title text-lg">Upload PDF</h2>
                <button
                  className="btn btn-ghost btn-sm btn-circle"
                  onClick={() => setShowUploadArea(false)}
                >
                  <X size={16} />
                </button>
              </div>

              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-base-content/20"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="avatar avatar-placeholder">
                    <div className="bg-neutral text-neutral-content rounded-full w-16">
                      <FileIcon className="w-8 h-8" />
                    </div>
                  </div>

                  <p className="font-medium">
                    {file ? (
                      <span className="text-success flex items-center gap-1">
                        <Check size={16} />
                        {pdfName}
                      </span>
                    ) : (
                      "Drag & drop PDF here or click to browse"
                    )}
                  </p>

                  <p className="text-xs text-base-content/70 max-w-sm">
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
                    className="btn btn-outline btn-sm mt-2"
                    onClick={triggerFileInput}
                  >
                    <Plus size={16} />
                    Browse Files
                  </button>
                </div>
              </div>

              <div className="card-actions justify-end mt-4">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowUploadArea(false)}
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
          </div>
        )}

        {isFetching && pdfs.length === 0 ? (
          <div className="flex justify-center items-center p-16">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : pdfs.length > 0 ? (
          <div className="card bg-base-200">
            <div className="card-body p-4">
              {viewMode === "grid" ? renderGridView() : renderListView()}
            </div>
          </div>
        ) : (
          <div className="card bg-base-200">
            <div className="card-body items-center text-center p-12">
              <div className="avatar placeholder mb-3">
                <div className="bg-neutral text-neutral-content rounded-full w-24">
                  <FileIcon className="w-12 h-12" />
                </div>
              </div>
              <h2 className="card-title text-2xl mb-2">No Documents Yet</h2>
              <p className="text-base-content/70 max-w-md mb-6">
                Your knowledge base is empty. Upload PDF documents to train your
                assistants with specific information.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => setShowUploadArea(true)}
              >
                <Upload size={16} />
                Upload Your First PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
