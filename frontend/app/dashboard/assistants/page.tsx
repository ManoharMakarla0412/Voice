"use client";

import { useState, useEffect } from "react";
import { BASE_URL } from "../../utils/constants";
import {
  Plus,
  Bot,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Trash2,
  Edit3,
  Sparkles,
  MessageSquare,
  Clock,
  Cpu,
  Terminal,
  X,
} from "lucide-react";

interface Assistant {
  id: string;
  name: string;
  createdAt: string;
  model: {
    model: string;
    messages: Array<{
      role: string;
      content: string;
    }>;
    provider: string;
  };
  firstMessage: string;
  endCallMessage: string;
}

export default function AssistantDashboard() {
  const [step, setStep] = useState(1);
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [formData, setFormData] = useState({
    name: "",
    firstMessage: "",
    systemPrompt: "",
    endCallMessage: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const fetchAssistants = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/assistant/get`);

      if (!response.ok) {
        throw new Error("Failed to fetch assistants");
      }

      const data = await response.json();
      setAssistants(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch assistants"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssistants();
  }, []);

  const createAssistant = async () => {
    try {
      const response = await fetch(`${BASE_URL}/assistant/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("auth_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstMessage: formData.firstMessage,
          modelProvider: "openai",
          modelName: "gpt-3.5-turbo",
          content: formData.systemPrompt,
          knowledgeBaseUrl: "https://example.com/knowledge-base",
          endCallMessage: formData.endCallMessage,
          messages: [{ role: "user", content: formData.systemPrompt }],
          name: formData.name,
          toolIds: ["e402a911-71a4-4879-90d6-92ec38b9d123"],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create assistant");
      }

      await response.json();

      // Show success toast
      showToast("Assistant created successfully!", "success");

      setIsModalOpen(false);
      setStep(1); // Reset step
      setFormData({
        name: "",
        firstMessage: "",
        systemPrompt: "",
        endCallMessage: "",
      });

      // Refresh the assistants list
      fetchAssistants();
    } catch (error: any) {
      console.error("Error creating assistant:", error.message);
      showToast("Failed to create assistant", "error");
    }
  };

  const showToast = (
    message: string,
    type: "info" | "success" | "warning" | "error"
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

  const stepTooltips = [
    "Enter the assistant name",
    "Configure messages",
    "Set the end call message",
  ];

  // Render the grid view of assistants
  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {assistants.map((assistant) => (
        <div
          key={assistant.id}
          className="card bg-base-100/45 shadow-xl h-full hover:shadow-2xl transition-all"
        >
          <div className="card-body p-0">
            {/* Header section with gradient background */}
            <div className="bg-gradient-to-r from-primary/10 to-base-300/20 p-5 rounded-t-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="avatar placeholder online">
                  <div className="bg-primary text-primary-content rounded-full w-12">
                    <span>
                      <Bot size={20} />
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="card-title text-lg font-bold">
                    {assistant.name}
                  </h2>
                  <div className="flex items-center text-xs text-base-content/70">
                    <Calendar size={12} className="mr-1.5" />
                    Created {new Date(assistant.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <div className="badge badge-primary badge-outline py-2.5 gap-1">
                  <Cpu size={12} />
                  {assistant.model.model}
                </div>
                <div className="badge badge-secondary badge-outline py-2.5">
                  {assistant.model.provider}
                </div>
              </div>
            </div>

            {/* Details section */}
            <div className="p-5 space-y-4">
              {assistant.firstMessage && (
                <div className="bg-base-200/40 rounded-lg p-3">
                  <div className="flex items-center text-sm font-medium mb-1.5">
                    <MessageSquare size={14} className="mr-1.5 text-primary" />
                    First Message
                  </div>
                  <p className="text-sm text-base-content/80 line-clamp-2">
                    "{assistant.firstMessage}"
                  </p>
                </div>
              )}

              {assistant.endCallMessage && (
                <div className="bg-base-200/40 rounded-lg p-3">
                  <div className="flex items-center text-sm font-medium mb-1.5">
                    <Clock size={14} className="mr-1.5 text-primary" />
                    End Call Message
                  </div>
                  <p className="text-sm text-base-content/80 line-clamp-2">
                    "{assistant.endCallMessage}"
                  </p>
                </div>
              )}

              <div className="card-actions justify-between mt-4 pt-3 border-t border-base-300/30">
                <button className="btn btn-sm btn-error btn-outline gap-1">
                  <Trash2 size={14} />
                  Delete
                </button>
                <button className="btn btn-sm btn-primary gap-1">
                  <Edit3 size={14} />
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Render the list view of assistants
  const renderListView = () => (
    <div className="overflow-x-auto">
      <table className="table table-zebra w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th>Model</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assistants.map((assistant) => (
            <tr key={assistant.id} className="hover">
              <td>
                <div className="flex items-center gap-3">
                  <div className="avatar placeholder">
                    <div className="bg-primary/20 text-primary rounded-full w-8">
                      <Bot size={14} />
                    </div>
                  </div>
                  <span className="font-medium">{assistant.name}</span>
                </div>
              </td>
              <td>
                <div className="flex items-center gap-2">
                  <div className="badge badge-primary badge-outline badge-sm gap-1">
                    <Cpu size={10} />
                    {assistant.model.model}
                  </div>
                  <span className="text-xs text-base-content/70">
                    {assistant.model.provider}
                  </span>
                </div>
              </td>
              <td className="text-xs text-base-content/70">
                {new Date(assistant.createdAt).toLocaleDateString()}
              </td>
              <td>
                <div className="join">
                  <button
                    className="btn btn-sm btn-ghost btn-square join-item tooltip"
                    data-tip="Edit"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    className="btn btn-sm btn-ghost text-error btn-square join-item tooltip"
                    data-tip="Delete"
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

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Header with view toggle */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold">Assistants</h1>
          <p className="text-base-content/70">
            Create and manage your AI voice assistants
          </p>
        </div>

        <div className="flex gap-3">
          <div className="join">
            <button
              className={`join-item btn btn-sm ${
                viewMode === "grid" ? "btn-active" : ""
              }`}
              onClick={() => setViewMode("grid")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </button>
            <button
              className={`join-item btn btn-sm ${
                viewMode === "list" ? "btn-active" : ""
              }`}
              onClick={() => setViewMode("list")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </button>
          </div>
          <button
            className="btn btn-primary btn-sm gap-1.5"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} />
            Create Assistant
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="alert alert-error mb-6">
            <AlertTriangle size={16} />
            <span>{error}</span>
            <button
              className="btn btn-circle btn-ghost btn-sm"
              onClick={() => setError(null)}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Display assistants */}
        {loading ? (
          <div className="flex justify-center items-center p-20">
            <div className="flex flex-col items-center gap-3">
              <span className="loading loading-spinner loading-lg text-primary"></span>
              <p className="text-base-content/70">Loading assistants...</p>
            </div>
          </div>
        ) : (
          <div className="card bg-base-100/45 shadow-xl">
            <div className="card-body p-4 md:p-6">
              {assistants.length > 0 ? (
                viewMode === "grid" ? (
                  renderGridView()
                ) : (
                  renderListView()
                )
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-20">
                  <div className="avatar placeholder mb-6">
                    <div className="bg-primary/10 text-primary rounded-full w-24 h-24">
                      <Bot size={40} />
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold mb-3">No Assistants Yet</h2>
                  <p className="text-base-content/70 max-w-md mb-8">
                    Create your first assistant to start building your AI voice
                    assistant experience.
                  </p>

                  <button
                    className="btn btn-primary gap-2"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <Sparkles size={18} />
                    Create Your First Assistant
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal for creating assistants */}
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box bg-base-100/45 shadow-xl max-w-2xl">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setIsModalOpen(false)}
            >
              <X size={16} />
            </button>

            <h3 className="font-bold text-xl mb-2 flex items-center gap-2">
              <Terminal size={20} className="text-primary" />
              Create New Assistant
            </h3>

            <p className="text-base-content/70 mb-4">
              Configure your AI assistant in 3 simple steps
            </p>

            {/* Step progress */}
            <div className="w-full bg-base-300 rounded-full h-1.5 mb-6">
              <div
                className="bg-primary h-1.5 rounded-full transition-all"
                style={{ width: `${(step / 3) * 100}%` }}
              ></div>
            </div>

            <div className="flex justify-between text-xs text-base-content/70 mb-6">
              {stepTooltips.map((tooltip, index) => (
                <div
                  key={index}
                  className={`flex flex-col items-center gap-1.5 w-1/3 ${
                    step > index + 1
                      ? "text-success"
                      : step === index + 1
                      ? "text-primary"
                      : ""
                  }`}
                >
                  <div
                    className={`
                    w-6 h-6 rounded-full flex items-center justify-center 
                    ${
                      step > index + 1
                        ? "bg-success/20 text-success"
                        : step === index + 1
                        ? "bg-primary text-base-100"
                        : "bg-base-300 text-base-content/70"
                    }
                  `}
                  >
                    {step > index + 1 ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <span className="text-center">{tooltip}</span>
                </div>
              ))}
            </div>

            <div className="py-4">
              {step === 1 && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">
                      Assistant Name
                    </span>
                    <span className="label-text-alt text-error">Required</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter a name for your assistant"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="input input-bordered w-full bg-base-200/50"
                  />
                  <label className="label">
                    <span className="label-text-alt text-base-content/70">
                      This name will be used to identify your assistant
                    </span>
                  </label>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">
                        First Message
                      </span>
                      <span className="label-text-alt text-error">
                        Required
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="Hello! How can I assist you today?"
                      value={formData.firstMessage}
                      onChange={(e) =>
                        handleInputChange("firstMessage", e.target.value)
                      }
                      className="input input-bordered w-full bg-base-200/50"
                    />
                    <label className="label">
                      <span className="label-text-alt text-base-content/70">
                        This is the first message your assistant will say to
                        users
                      </span>
                    </label>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">
                        System Prompt
                      </span>
                      <span className="label-text-alt text-error">
                        Required
                      </span>
                    </label>
                    <textarea
                      placeholder="You are a helpful assistant that..."
                      value={formData.systemPrompt}
                      onChange={(e) =>
                        handleInputChange("systemPrompt", e.target.value)
                      }
                      className="textarea textarea-bordered min-h-[150px] w-full bg-base-200/50"
                    ></textarea>
                    <label className="label">
                      <span className="label-text-alt text-base-content/70">
                        Instructions that define how your assistant behaves
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">
                      End Call Message
                    </span>
                    <span className="label-text-alt text-error">Required</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Thank you for contacting us. Have a great day!"
                    value={formData.endCallMessage}
                    onChange={(e) =>
                      handleInputChange("endCallMessage", e.target.value)
                    }
                    className="input input-bordered w-full bg-base-200/50"
                  />
                  <label className="label">
                    <span className="label-text-alt text-base-content/70">
                      This message will be spoken when the call ends
                    </span>
                  </label>
                </div>
              )}
            </div>

            <div className="divider my-2"></div>

            <div className="flex justify-between items-center mt-6">
              <button
                className="btn btn-outline btn-sm gap-1"
                onClick={handleBack}
                disabled={step === 1}
              >
                <ChevronLeft size={16} />
                Back
              </button>

              <div className="flex items-center gap-3">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>

                {step < 3 ? (
                  <button
                    className="btn btn-primary btn-sm gap-1"
                    onClick={handleNext}
                    disabled={
                      (step === 1 && !formData.name) ||
                      (step === 2 &&
                        (!formData.firstMessage || !formData.systemPrompt))
                    }
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    className="btn btn-primary btn-sm gap-1"
                    onClick={createAssistant}
                    disabled={!formData.endCallMessage}
                  >
                    <CheckCircle2 size={16} />
                    Create Assistant
                  </button>
                )}
              </div>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setIsModalOpen(false)}
          ></div>
        </div>
      )}
    </div>
  );
}
