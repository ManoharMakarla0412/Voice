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
} from "lucide-react";
import { BASE_URL } from "../../utils/constants";

interface PhoneNumber {
  id: string;
  number: string;
  name: string;
  provider: string;
  twilioAccountSid: string;
  twilioAuthToken: string;
  assistantId: string;
}

interface Assistant {
  id: string;
  name: string;
  description?: string;
}

export default function PhoneNumberManager() {
  const [showImportModal, setShowImportModal] = useState(false);
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
  });

  useEffect(() => {
    Promise.all([fetchPhoneNumbers(), fetchAssistants()]).finally(() =>
      setIsLoading(false)
    );
  }, []);

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
    }
  };

  const fetchPhoneNumbers = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/phone/getphonenumbers`);
      if (!response.ok) throw new Error("Failed to fetch phone numbers");
      const data = await response.json();
      setPhoneNumbers(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch phone numbers"
      );
    }
  };

  const handleChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAssistantChange = async (
    phoneId: string,
    assistantId: string
  ) => {
    // Here you would implement the API call to update the assistant for this phone number
    console.log("Updating assistant:", { phoneId, assistantId });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/api/phone/createphonenumber`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchPhoneNumbers();
        setShowImportModal(false);
        // Create a toast notification
        const toast = document.createElement("div");
        toast.className = "toast toast-end";
        toast.innerHTML = `
          <div class="alert alert-success">
            <span>Phone number imported successfully!</span>
          </div>
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error);
      }
    } catch (error) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    // Implementation for delete functionality would go here
    console.log("Delete phone number:", id);
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
        <div key={phone.id} className="card bg-base-100 shadow-xl">
          <div className="card-body p-0">
            {/* Header section */}
            <div className="bg-base-300/30 p-4 rounded-t-xl">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="card-title text-lg">{phone.number}</h2>
                  <p className="text-sm text-base-content/70">{phone.name}</p>
                </div>
                <button
                  onClick={() => handleDelete(phone.id)}
                  className="btn btn-ghost btn-sm btn-circle text-error hover:bg-error/10"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="mt-3 flex items-center gap-2 bg-base-300/50 rounded-md px-3 py-2 text-sm overflow-hidden">
                <span className="truncate text-xs text-base-content/70">
                  {phone.id}
                </span>
                <button
                  className="btn btn-ghost btn-xs hover:bg-base-300 ml-auto"
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

            {/* Inbound settings */}
            <div className="p-4">
              <h3 className="font-medium mb-2">Inbound Settings</h3>
              <p className="text-xs text-base-content/70 mb-4">
                Assign an assistant to this phone number to handle incoming
                calls.
              </p>

              <div className="space-y-3">
                {/* Phone number display */}
                <div>
                  <label className="label label-text text-xs py-0">
                    Inbound Phone Number
                  </label>
                  <div className="flex rounded-md overflow-hidden border border-base-300 mt-1">
                    <div className="px-3 py-2 bg-base-200 border-r border-base-300">
                      🇺🇸
                    </div>
                    <input
                      value={phone.number}
                      disabled
                      className="flex-1 input input-sm input-bordered rounded-none bg-base-100/50 border-0"
                    />
                    <div className="px-3 py-2 text-success">✓</div>
                  </div>
                </div>

                {/* Assistant selector */}
                <div>
                  <label className="label label-text text-xs py-0">
                    Assistant
                  </label>
                  <select
                    className="select select-bordered select-sm w-full mt-1"
                    value={phone.assistantId}
                    onChange={(e) =>
                      handleAssistantChange(phone.id, e.target.value)
                    }
                  >
                    <option disabled value="">
                      Select Assistant
                    </option>
                    {assistants.map((assistant) => (
                      <option key={assistant.id} value={assistant.id}>
                        {assistant.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Squad section */}
                <div>
                  <label className="label label-text text-xs py-0">Squad</label>
                  <div className="alert alert-warning mt-1 py-2 text-xs">
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
                  <div className="flex rounded-md overflow-hidden border border-base-300 mt-1">
                    <div className="dropdown dropdown-hover">
                      <div
                        tabIndex={0}
                        role="button"
                        className="px-3 py-2 bg-base-200 border-r border-base-300 flex items-center"
                      >
                        <span className="mr-1">🇺🇸</span>
                        <ChevronDown size={14} />
                      </div>
                      <ul
                        tabIndex={0}
                        className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
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
                      className="flex-1 input input-sm input-bordered rounded-none bg-base-100/50 border-0"
                    />
                  </div>
                </div>
              </div>
            </div>
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
          <tr>
            <th>Phone Number</th>
            <th>Name</th>
            <th>Assistant</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {phoneNumbers.map((phone) => (
            <tr key={phone.id} className="hover">
              <td>
                <div className="flex items-center gap-2">
                  <div className="badge badge-sm">🇺🇸</div>
                  <span>{phone.number}</span>
                </div>
              </td>
              <td>{phone.name}</td>
              <td>
                <select
                  className="select select-bordered select-xs w-full max-w-xs"
                  value={phone.assistantId}
                  onChange={(e) =>
                    handleAssistantChange(phone.id, e.target.value)
                  }
                >
                  <option disabled value="">
                    Select Assistant
                  </option>
                  {assistants.map((assistant) => (
                    <option key={assistant.id} value={assistant.id}>
                      {assistant.name}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <div className="flex gap-2">
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
                    onClick={() => handleDelete(phone.id)}
                  >
                    <Trash2 size={14} />
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
      <div className="min-h-screen bg-base-200 p-8 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with view toggle */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-2xl font-bold">Phone Numbers</h1>
          <div className="flex gap-2">
            <div className="join mr-2">
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
              onClick={() => setShowImportModal(true)}
              className="btn btn-primary btn-sm"
            >
              <Plus size={16} />
              Import Number
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-error mb-6">
            <AlertTriangle size={18} />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="btn btn-sm btn-circle btn-ghost ml-auto"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {phoneNumbers.length === 0 && !isLoading ? (
          // Empty state
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body items-center text-center p-8">
              <div className="avatar placeholder mb-4">
                <div className="bg-base-300 text-base-content rounded-full w-24">
                  <span className="text-3xl">
                    <Phone size={36} />
                  </span>
                </div>
              </div>
              <h2 className="card-title text-2xl mb-2">No Phone Numbers Yet</h2>
              <p className="mb-6 text-base-content/70 max-w-md">
                Assistants are able to be connected to phone numbers for calls.
                You can import from Twilio, vonage, or buy one directly for use
                with your assistants.
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
              <div className="alert alert-warning mt-6 text-sm">
                <AlertTriangle size={16} />
                <span>
                  Please add{" "}
                  <a href="#" className="link link-hover">
                    Card Details
                  </a>{" "}
                  to Buy a Number
                </span>
              </div>
            </div>
          </div>
        ) : (
          // Phone numbers with toggle view
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body p-4">
              {viewMode === "grid" ? renderGridView() : renderListView()}
            </div>
          </div>
        )}
      </div>

      {/* Import Modal with DaisyUI */}
      {showImportModal && (
        <div className="modal modal-open">
          <div className="modal-box bg-base-100">
            <h3 className="font-bold text-xl flex items-center gap-2">
              <Phone size={20} />
              Import Phone Number
            </h3>
            <p className="py-2 text-sm text-base-content/70">
              Import your phone number from Twilio
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Twilio Phone Number</span>
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
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Twilio Account SID</span>
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
                  <span className="label-text">Twilio Auth Token</span>
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
                  <span className="label-text">Label</span>
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
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Import from Twilio"
                  )}
                </button>
              </div>
            </form>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setShowImportModal(false)}
          ></div>
        </div>
      )}
    </div>
  );
}
