"use client";

import { useState, useEffect } from "react";
import {
  Phone,
  Trash2,
  Copy,
  ChevronDown,
  Plus,
  AlertTriangle,
  ExternalLink,
  Check,
  LayoutGrid,
  List,
  X,
  Info,
} from "lucide-react";
import { BASE_URL } from "../../utils/constants";

interface PhoneNumber {
  id: string;
  number: string;
  name: string;
  provider: string;
  twilioAccountSid: string;
  twilioAuthToken: string;
  assistantId: string; // This stores the VAPI assistant ID
  vapiId: string;
}

interface Assistant {
  _id: string; // Database ID
  userId: string;
  vapiAssistantId: string; // VAPI ID
  name: string;
  description?: string;
}

export default function PhoneNumberManager() {
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [phoneToDelete, setPhoneToDelete] = useState<{ id: string; vapiId: string; name: string; number: string } | null>(null);
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [formData, setFormData] = useState({
    provider: "twilio",
    number: "",
    twilioAccountSid: "",
    twilioAuthToken: "",
    name: "",
    userId: "",
    assistantId: "", // This will store the VAPI assistant ID
  });
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [assistantUpdateLoading, setAssistantUpdateLoading] = useState<string | null>(null);
  const [importLoading, setImportLoading] = useState(false);

  useEffect(() => {
    Promise.all([fetchPhoneNumbers(), fetchAssistants()]).finally(() =>
      setIsLoading(false)
    );
  }, []);

  useEffect(() => {
    const userId = sessionStorage.getItem("user_id");
    if (userId) {
      setFormData((prevData) => ({
        ...prevData,
        userId,
      }));
    }
  }, []);

  // Helper function to find the database _id for an assistant based on its VAPI ID
  const findAssistantDbId = (vapiAssistantId: string | null): string => {
    if (!vapiAssistantId) return "";

    const assistant = assistants.find((a) => a.vapiAssistantId === vapiAssistantId);
    return assistant ? assistant._id : "";
  };

  const fetchAssistants = async () => {
    try {
      const userId = sessionStorage.getItem("user_id");
      if (!userId) throw new Error("User ID not found in session storage");
      const response = await fetch(`${BASE_URL}/assistant/getassitant/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch assistants");
      const data = await response.json();
      console.log("Fetched assistants:", data); // Debug
      setAssistants(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch assistants");
    }
  };

  const fetchPhoneNumbers = async () => {
    try {
      const userId = sessionStorage.getItem("user_id");
      if (!userId) throw new Error("User ID not found in session storage");

      const response = await fetch(`${BASE_URL}/api/phone/getphonenumbersbyuser/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch phone numbers");

      const data = await response.json();
      console.log("Fetched phone numbers:", data); // Debug
      setPhoneNumbers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch phone numbers");
    }
  };

  const handleChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAssistantChange = async (phoneId: string, assistantDbId: string) => {
    try {
      setAssistantUpdateLoading(phoneId); // Only set loading for this specific phone

      // Find the phone number by ID to get its vapiId
      const phoneNumber = phoneNumbers.find((phone) => phone.id === phoneId);
      if (!phoneNumber) {
        throw new Error("Phone number not found");
      }

      // Find the assistant to get its vapiAssistantId
      const assistant = assistants.find((assistant) => assistant._id === assistantDbId);
      if (!assistant) {
        throw new Error("Assistant not found");
      }

      // Send the update request to our backend API
      const response = await fetch(`${BASE_URL}/api/phone/updateassistant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneId: phoneNumber.vapiId, // Use the VAPI ID for the phone number
          assistantId: assistant.vapiAssistantId, // Use the VAPI assistant ID
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update assistant");
      }

      // Update local state to reflect the change
      setPhoneNumbers((prev) =>
        prev.map((phone) =>
          phone.id === phoneId ? { ...phone, assistantId: assistant.vapiAssistantId } : phone
        )
      );

      // Show success toast using DaisyUI
      const toastContainer = document.createElement("div");
      toastContainer.className = "toast toast-end";

      const alert = document.createElement("div");
      alert.className = "alert alert-success";
      alert.innerHTML = `<span>Assistant updated successfully!</span>`;

      toastContainer.appendChild(alert);
      document.body.appendChild(toastContainer);

      // Remove toast after 3 seconds
      setTimeout(() => toastContainer.remove(), 3000);

    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to update assistant");
    } finally {
      setAssistantUpdateLoading(null);
    }
  };

  const handleDelete = async (id: string, vapiId: string) => {
    try {
      setDeleteLoading(id);

      const response = await fetch(`${BASE_URL}/api/phone/deletephonenumber/${vapiId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete phone number");
      }

      // After successful deletion, update the UI by removing the deleted phone number
      setPhoneNumbers((prev) => prev.filter((phone) => phone.id !== id));

      // Show success toast using DaisyUI
      const toastContainer = document.createElement("div");
      toastContainer.className = "toast toast-end";

      const alert = document.createElement("div");
      alert.className = "alert alert-success";
      alert.innerHTML = `<span>Phone number deleted successfully!</span>`;

      toastContainer.appendChild(alert);
      document.body.appendChild(toastContainer);

      // Remove toast after 3 seconds
      setTimeout(() => toastContainer.remove(), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to delete phone number");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      setImportLoading(true);

      // Make sure userId is in the payload
      if (!formData.userId) {
        const userId = sessionStorage.getItem("user_id");
        if (userId) {
          setFormData((prev) => ({ ...prev, userId }));
        } else {
          setError("User ID not found. Please log in again.");
          setImportLoading(false);
          return;
        }
      }

      // Validate that assistantId is selected
      if (!formData.assistantId) {
        setError("Please select an assistant for this phone number.");
        setImportLoading(false);
        return;
      }

      const response = await fetch(`${BASE_URL}/api/phone/createphonenumber`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchPhoneNumbers();
        setShowImportModal(false);
        setFormData({
          provider: "twilio",
          number: "",
          twilioAccountSid: "",
          twilioAuthToken: "",
          name: "",
          userId: formData.userId,
          assistantId: "",
        });

        // Create a toast notification using DaisyUI
        const toastContainer = document.createElement("div");
        toastContainer.className = "toast toast-end";

        const alert = document.createElement("div");
        alert.className = "alert alert-success";
        alert.innerHTML = `<span>Phone number imported successfully!</span>`;

        toastContainer.appendChild(alert);
        document.body.appendChild(toastContainer);

        // Remove toast after 3 seconds
        setTimeout(() => toastContainer.remove(), 3000);
      } else {
        const errorData = await response.json();
        setError(
          errorData.error || errorData.message || "Failed to import phone number"
        );
      }
    } catch (error) {
      setError("An unexpected error occurred.");
      console.error(error);
    } finally {
      setImportLoading(false);
    }
  };

  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Grid view render function
  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {phoneNumbers.map((phone) => (
        <div
          key={phone.id}
          className="card bg-base-300/80 border-2 border-primary/30 shadow-lg flex flex-col m-2"
        >
          {/* Header section */}
          <div className="bg-primary/10 p-4 rounded-t-lg border-b border-base-200/30">
            <div className="flex items-center gap-3">
              <div className="avatar avatar-placeholder">
                <div className="bg-primary/20 text-primary rounded-full w-12">
                  <Phone size={20} />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="card-title text-lg">{phone.number}</h2>
                <p className="text-sm text-base-content/70">{phone.name}</p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 bg-base-200/60 rounded-md px-3 py-2 text-sm overflow-hidden shadow-sm">
              <span className="truncate text-xs text-base-content/70">
                {phone.id}
              </span>
              <button
                className="btn btn-ghost btn-xs hover:bg-base-300/50 ml-auto"
                onClick={() => copyToClipboard(phone.id)}
              >
                {copiedId === phone.id ? (
                  <span className="text-success text-xs flex items-center">
                    <span className="mr-1">Copied!</span>
                    <Check size={14} />
                  </span>
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>
          </div>

          {/* Card body with settings - flex-1 ensures equal height */}
          <div className="card-body p-5 flex-1">
            <h3 className="font-medium text-base-content">Inbound Settings</h3>
            <p className="text-xs text-base-content/70 mb-4">
              Assign an assistant to this phone number to handle incoming calls.
            </p>

            <div className="space-y-4 flex-1">
              {/* Phone number display */}
              <div>
                <label className="label label-text text-xs py-0">
                  Inbound Phone Number
                </label>
                <div className="join w-full mt-1 shadow-sm">
                  <div className="join-item flex items-center px-3 bg-base-200/80 h-8">
                    🇺🇸
                  </div>
                  <input
                    value={phone.number}
                    disabled
                    className="join-item input input-sm h-8 flex-1 bg-base-100/60"
                  />
                  <div className="join-item flex items-center px-3 bg-base-200/80 text-success h-8">
                    <Check size={14} />
                  </div>
                </div>
              </div>

              {/* Assistant selector - Updated to use mapped assistantId */}
              <div>
                <label className="label label-text text-xs py-0">
                  Assistant
                </label>
                <div className="join w-full mt-1 shadow-sm">
                  {assistantUpdateLoading === phone.id ? (
                    <div className="select select-bordered select-xs w-full flex items-center justify-center bg-base-100/70">
                      <span className="loading loading-spinner loading-xs"></span>
                      <span className="ml-2 text-xs">Updating...</span>
                    </div>
                  ) : (
                    <select
                      className="select select-bordered select-xs w-full max-w-xs bg-base-100/70"
                      value={findAssistantDbId(phone.assistantId)}
                      onChange={(e) =>
                        handleAssistantChange(phone.id, e.target.value)
                      }
                    >
                      <option disabled value="">
                        Select Assistant
                      </option>
                      {assistants.map((assistant) => (
                        <option key={assistant._id} value={assistant._id}>
                          {assistant.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Squad section */}
              <div>
                <label className="label label-text text-xs py-0">Squad</label>
                <div className="alert alert-warning bg-warning/10 border-warning/30 mt-1 py-2 text-xs shadow-sm">
                  <AlertTriangle size={14} />
                  <span>
                    No squads available.{" "}
                    <a className="link link-primary">Create a squad</a> to
                    enable this feature.
                  </span>
                </div>
              </div>

              {/* Fallback destination */}
              <div>
                <label className="label label-text text-xs py-0">
                  Fallback Destination
                  <span className="label-text-alt text-xs text-base-content/60">
                    Optional
                  </span>
                </label>
                <div className="join w-full mt-1 shadow-sm">
                  <div className="dropdown dropdown-hover">
                    <div
                      tabIndex={0}
                      role="button"
                      className="join-item flex items-center px-3 bg-base-200/80 h-8"
                    >
                      <span className="mr-1">🇺🇸</span>
                      <ChevronDown size={14} />
                    </div>
                    <ul
                      tabIndex={0}
                      className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100/90 border border-base-200/60 rounded-box w-52"
                    >
                      <li>
                        <a>🇺🇸 United States</a>
                      </li>
                      <li>
                        <a>🇬🇧 United Kingdom</a>
                      </li>
                      <li>
                        <a>🇨🇦 Canada</a>
                      </li>
                    </ul>
                  </div>
                  <input
                    placeholder="Enter a phone number"
                    className="join-item input input-sm h-8 flex-1 bg-base-100/60"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card Actions - always at bottom */}
          <div className="card-actions justify-end p-4 border-t border-base-100/20 mt-auto">
            <button
              className="btn btn-sm btn-error btn-outline gap-1"
              onClick={() => {
                setPhoneToDelete({
                  id: phone.id,
                  vapiId: phone.vapiId,
                  name: phone.name,
                  number: phone.number,
                });
                setShowDeleteModal(true);
              }}
              disabled={deleteLoading === phone.id}
            >
              {deleteLoading === phone.id ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <Trash2 size={14} />
              )}
              Delete Number
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  // List view render function
  const renderListView = () => (
    <div className="overflow-x-auto">
      <table className="table table-zebra w-full">
        <thead>
          <tr className="bg-primary/20">
            <th className="text-base-content/90 font-semibold text-center">
              Phone Number
            </th>
            <th className="text-base-content/90 font-semibold text-center">
              Name
            </th>
            <th className="text-base-content/90 font-semibold text-center">
              Assistant
            </th>
            <th className="text-base-content/90 font-semibold text-center">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {phoneNumbers.map((phone) => (
            <tr key={phone.id} className="hover backdrop-blur-sm">
              <td className="text-center">
                <div className="flex items-center gap-2 justify-center">
                  <div className="badge badge-sm">🇺🇸</div>
                  <span className="font-medium">{phone.number}</span>
                </div>
              </td>
              <td className="text-center">{phone.name}</td>
              <td className="text-center">
                {assistantUpdateLoading === phone.id ? (
                  <div className="select select-bordered select-xs w-full flex items-center justify-center bg-base-100/70">
                    <span className="loading loading-spinner loading-xs"></span>
                    <span className="ml-2 text-xs">Updating...</span>
                  </div>
                ) : (
                  <select
                    className="select select-bordered select-xs w-full max-w-xs bg-base-100/70"
                    value={findAssistantDbId(phone.assistantId)}
                    onChange={(e) =>
                      handleAssistantChange(phone.id, e.target.value)
                    }
                  >
                    <option disabled value="">
                      Select Assistant
                    </option>
                    {assistants.map((assistant) => (
                      <option key={assistant._id} value={assistant._id}>
                        {assistant.name}
                      </option>
                    ))}
                  </select>
                )}
              </td>
              <td className="text-center">
                <div className="flex gap-2 justify-center">
                  <button
                    className="btn btn-ghost btn-xs tooltip"
                    data-tip="Copy ID"
                    onClick={() => copyToClipboard(phone.id)}
                  >
                    {copiedId === phone.id ? (
                      <Check size={14} className="text-success" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                  <button
                    className="btn btn-ghost btn-xs text-error"
                    onClick={() => {
                      setPhoneToDelete({
                        id: phone.id,
                        vapiId: phone.vapiId,
                        name: phone.name,
                        number: phone.number,
                      });
                      setShowDeleteModal(true);
                    }}
                    disabled={deleteLoading === phone.id}
                  >
                    {deleteLoading === phone.id ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header with title and stats */}
        <div className="card bg-base-300/80 backdrop-blur-xl border-2 border-primary/30 shadow-lg">
          <div className="card-body">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Phone className="h-6 w-6 text-primary" />
                  Phone Numbers
                </h1>
                <p className="text-base-content/80 mt-1">
                  Manage phone numbers for your AI voice assistants
                </p>
              </div>

              {/* Stats */}
              <div className="stats bg-base-200/60 shadow-md border border-base-200/30">
                <div className="stat">
                  <div className="flex items-center gap-2">
                    <Phone size={18} className="text-primary" />
                    <div className="stat-title font-medium">Total Numbers</div>
                  </div>
                  <div className="stat-value text-primary text-center">
                    {phoneNumbers.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="card bg-base-300/80 backdrop-blur-xl border-2 border-primary/30 shadow-lg">
          <div className="card-body">
            <div className="flex flex-wrap items-center gap-4">
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
                onClick={() => setShowImportModal(true)}
                className="btn btn-primary btn-sm"
              >
                <Plus size={16} />
                Import Number
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

        {/* Phone Numbers content */}
        <div className="card bg-base-200/80 backdrop-blur-xl border-2 border-primary/30 shadow-lg overflow-hidden">
          <div className="card-body p-0">
            <div className="alert alert-info bg-info/10 border-info/30 rounded-none">
              <Info size={18} />
              <span>
                Connect phone numbers to your AI assistants to enable voice
                communication
              </span>
            </div>

            {phoneNumbers.length === 0 ? (
              // Empty state
              <div className="card-body items-center text-center py-16">
                <div className="avatar avatar-placeholder">
                  <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center shadow-md">
                    <Phone className="w-12 h-12 text-primary" />
                  </div>
                </div>
                <h2 className="card-title text-2xl mt-6 mb-2">
                  No Phone Numbers Yet
                </h2>
                <p className="text-base-content/70 max-w-md mb-8">
                  Assistants are able to be connected to phone numbers for
                  calls. You can import from Twilio, vonage, or buy one directly
                  for use with your assistants.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setShowImportModal(true)}
                    className="btn btn-primary"
                  >
                    <Plus size={16} />
                    Import Number
                  </button>
                  <button className="btn btn-ghost">
                    <ExternalLink size={16} />
                    Documentation
                  </button>
                </div>
                <div className="alert alert-warning bg-warning/10 border-warning/30 mt-8 text-sm shadow-md">
                  <AlertTriangle size={16} />
                  <span>
                    Please add{" "}
                    <a href="#" className="link link-primary font-medium">
                      Card Details
                    </a>{" "}
                    to Buy a Number
                  </span>
                </div>
              </div>
            ) : (
              // Phone numbers list
              <div className="p-0">
                {viewMode === "grid" ? renderGridView() : renderListView()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Import Modal with DaisyUI */}
      {showImportModal && (
        <dialog open className="modal">
          <div className="modal-box bg-base-300/95 backdrop-blur-xl border-2 border-primary/30 shadow-xl max-w-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Phone className="text-primary" size={18} />
                <h2 className="font-bold text-lg">Import Phone Number</h2>
              </div>
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => setShowImportModal(false)}
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-base-content/70 mb-4">
              Import your existing phone number from Twilio to use with your AI
              assistants
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Twilio Phone Number
                  </span>
                  <span className="label-text-alt text-error">Required</span>
                </label>
                <input
                  type="text"
                  name="number"
                  value={formData.number}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="+14156021922"
                  required
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/70">
                    Enter the full phone number including country code
                  </span>
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Twilio Account SID
                  </span>
                  <span className="label-text-alt text-error">Required</span>
                </label>
                <input
                  type="text"
                  name="twilioAccountSid"
                  value={formData.twilioAccountSid}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="AC1234567890abcdef1234567890****"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Twilio Auth Token
                  </span>
                  <span className="label-text-alt text-error">Required</span>
                </label>
                <input
                  type="password"
                  name="twilioAuthToken"
                  value={formData.twilioAuthToken}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="Twilio Auth Token"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Label</span>
                  <span className="label-text-alt text-error">Required</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="Sales Line"
                  required
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/70">
                    A friendly name to identify this phone number
                  </span>
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Assistant</span>
                  <span className="label-text-alt text-error">Required</span>
                </label>
                <select
                  name="assistantId"
                  value={formData.assistantId}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                  required
                >
                  <option value="" disabled>
                    Select an Assistant
                  </option>
                  {assistants.map((assistant) => (
                    <option key={assistant._id} value={assistant.vapiAssistantId}>
                      {assistant.name}
                    </option>
                  ))}
                </select>
                <label className="label">
                  <span className="label-text-alt text-base-content/70">
                    The AI assistant that will handle calls to this number
                  </span>
                </label>
              </div>

              <div className="divider my-2"></div>

              <div className="flex justify-end items-center mt-4">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="btn btn-ghost btn-sm mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={importLoading}
                >
                  {importLoading ? (
                    <>
                      <span className="loading loading-spinner loading-sm mr-2"></span>
                      Importing...
                    </>
                  ) : (
                    <>
                      <Plus size={16} className="mr-1" />
                      Import from Twilio
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Modal backdrop */}
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowImportModal(false)}>close</button>
          </form>
        </dialog>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && phoneToDelete && (
        <dialog open className="modal">
          <div className="modal-box bg-base-300/95 backdrop-blur-xl border-2 border-error/30 shadow-xl">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <AlertTriangle className="text-error" size={18} />
              Confirm Deletion
            </h3>
            <p className="py-4">
              Are you sure you want to delete  <span className="font-semibold">{phoneToDelete.name}</span> ({phoneToDelete.number})? This action cannot be undone.
            </p>
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-error"
                disabled={deleteLoading === phoneToDelete.id}
                onClick={() => {
                  handleDelete(phoneToDelete.id, phoneToDelete.vapiId);
                  setShowDeleteModal(false);
                }}
              >
                {deleteLoading === phoneToDelete.id ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete Phone Number
                  </>
                )}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowDeleteModal(false)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}