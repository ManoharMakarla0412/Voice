"use client";

import { useState } from "react";
import useAssistant from "../../hooks/useAssistant";
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

export default function AssistantDashboard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    firstMessage: "",
    systemPrompt: "",
    endCallMessage: "",
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentAssistantId, setCurrentAssistantId] = useState<string | null>(null);

  const {
    assistants,
    loading,
    createLoading,
    updateLoading,
    deleteLoading,
    error,
    createAssistant,
    updateAssistant,
    deleteAssistant,
  } = useAssistant();

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      firstMessage: "",
      systemPrompt: "",
      endCallMessage: "",
    });
    setStep(1);
  };

  const handleCreateAssistant = async () => {
    try {
      await createAssistant({
        name: formData.name,
        firstMessage: formData.firstMessage,
        endCallMessage: formData.endCallMessage,
        model: {
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: formData.systemPrompt }],
          provider: "openai",
        },
        voice: {
          provider: "deepgram",
          voiceId: "luna",
        },
        transcriber: {
          provider: "deepgram",
          language: "en",
        },
      });

      showToast("Assistant created successfully!", "success");
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("Error creating assistant:", error);
      showToast(`Failed to create assistant: ${error.message}`, "error");
    }
  };

  const handleEditClick = (assistant: typeof assistants[0]) => {
    setFormData({
      name: assistant.name,
      firstMessage: assistant.firstMessage,
      systemPrompt: assistant.model.messages[0]?.content || "",
      endCallMessage: assistant.endCallMessage,
    });
    setCurrentAssistantId(assistant.id);
    setIsEditModalOpen(true);
  };

  const handleUpdateAssistant = async () => {
    if (!currentAssistantId) return;

    try {
      const updatePayload = {
        name: formData.name,
        firstMessage: formData.firstMessage,
        endCallMessage: formData.endCallMessage,
        model: {
          messages: [{ role: "user", content: formData.systemPrompt }],
        },
      };

      await updateAssistant(currentAssistantId, updatePayload);

      showToast("Assistant updated successfully!", "success");
      setIsEditModalOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("Error updating assistant:", error);
      showToast(`Failed to update assistant: ${error.message}`, "error");
    }
  };

  const handleDeleteClick = (assistantId: string) => {
    setCurrentAssistantId(assistantId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteAssistant = async () => {
    if (!currentAssistantId) return;

    try {
      await deleteAssistant(currentAssistantId);
      showToast("Assistant deleted successfully!", "success");
      setIsDeleteModalOpen(false);
      setCurrentAssistantId(null);
    } catch (error: any) {
      console.error("Error deleting assistant:", error.message);
      showToast("Failed to delete assistant", "error");
    }
  };

  const showToast = (
    message: string,
    type: "info" | "success" | "warning" | "error"
  ) => {
    const displayMessage = message.length > 100 
      ? `${message.substring(0, 97)}...` 
      : message;
    
    const toast = document.createElement("div");
    toast.className = "toast toast-top toast-end";

    const alert = document.createElement("div");
    alert.className = `alert alert-${type} py-2`;
    
    const contentSpan = document.createElement("span");
    contentSpan.textContent = displayMessage;
    alert.appendChild(contentSpan);

    toast.appendChild(alert);
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 5000);
  };

  const stepTooltips = [
    "Enter the assistant name",
    "Configure messages",
    "Set the end call message",
  ];

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="card bg-base-300/80 border-2 border-primary/30 shadow-lg">
          <div className="card-body">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Bot className="h-6 w-6 text-primary" />
                  AI Assistants
                </h1>
                <p className="text-base-content/80 mt-1">
                  Create and manage your AI voice assistants
                </p>
              </div>

              <div className="stats bg-base-200/60 shadow-md border border-base-200/30">
                <div className="stat">
                  <div className="flex items-center gap-2">
                    <Bot size={18} className="text-primary" />
                    <div className="stat-title font-medium">
                      Total Assistants
                    </div>
                  </div>
                  <div className="stat-value text-primary text-center">
                    {assistants.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-300/80 border-2 border-primary/30 shadow-lg">
          <div className="card-body">
            <div className="flex flex-wrap items-center justify-end">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus size={16} />
                Create Assistant
              </button>
            </div>
          </div>
        </div>

        <div className="card bg-base-300/80 border-2 border-primary/30 shadow-lg overflow-hidden">
          <div className="card-body p-0">
            <div className="alert alert-info bg-info/10 border-info/30 rounded-none">
              <Terminal size={18} />
              <span>
                Create AI assistants that can communicate with your users via
                voice
              </span>
            </div>

            {loading ? (
              <div className="flex justify-center items-center p-16">
                <div className="flex flex-col items-center gap-3">
                  <span className="loading loading-spinner loading-lg text-primary"></span>
                  <p className="text-base-content/70">Loading assistants...</p>
                </div>
              </div>
            ) : assistants.length > 0 ? (
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {assistants.map((assistant) => (
                    <div
                      key={assistant.id}
                      className="card bg-base-300/80 border-2 border-primary/30 shadow-lg flex flex-col"
                    >
                      <div className="bg-primary/10 p-5 rounded-t-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="avatar avatar-placeholder">
                            <div className="bg-primary/20 text-primary-content rounded-full w-12">
                              <Bot size={20} />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h2 className="card-title text-lg font-bold">
                              {assistant.name}
                            </h2>
                            <div className="flex items-center text-xs text-base-content/70">
                              <Calendar size={12} className="mr-1.5" />
                              Created{" "}
                              {new Date(
                                assistant.createdAt
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <div className="badge badge-primary badge-outline py-2.5 gap-1">
                            <Cpu size={12} />
                            {assistant.model.model}
                          </div>
                          <div className="badge badge-secondary badge-outline py-2.5">
                            {assistant.model.provider}
                          </div>
                        </div>
                      </div>

                      <div className="card-body p-5 flex-1 flex flex-col gap-4">
                        <div className="bg-base-100/20 rounded-lg p-3 border border-base-100/10 min-h-[85px] flex flex-col">
                          <div className="flex items-center text-sm font-medium mb-1.5">
                            <MessageSquare
                              size={14}
                              className="mr-1.5 text-primary"
                            />
                            First Message
                          </div>
                          {assistant.firstMessage ? (
                            <p className="text-sm text-base-content/80 line-clamp-2 flex-1">
                              "{assistant.firstMessage}"
                            </p>
                          ) : (
                            <p className="text-sm text-base-content/40 italic flex-1">
                              No first message configured
                            </p>
                          )}
                        </div>

                        <div className="bg-base-100/20 rounded-lg p-3 border border-base-100/10 min-h-[85px] flex flex-col">
                          <div className="flex items-center text-sm font-medium mb-1.5">
                            <Clock size={14} className="mr-1.5 text-primary" />
                            End Call Message
                          </div>
                          {assistant.endCallMessage ? (
                            <p className="text-sm text-base-content/80 line-clamp-2 flex-1">
                              "{assistant.endCallMessage}"
                            </p>
                          ) : (
                            <p className="text-sm text-base-content/40 italic flex-1">
                              No end call message configured
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="card-actions justify-between p-4 border-t border-base-100/20 mt-auto">
                        <button
                          className="btn btn-sm btn-error btn-outline gap-1"
                          onClick={() => handleDeleteClick(assistant.id)}
                          disabled={deleteLoading === assistant.id}
                        >
                          {deleteLoading === assistant.id ? (
                            <>
                              <span className="loading loading-spinner loading-sm"></span>
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 size={14} />
                              Delete
                            </>
                          )}
                        </button>
                        {/* <button
                          className="btn btn-sm btn-primary gap-1"
                          onClick={() => handleEditClick(assistant)}
                        >
                          <Edit3 size={14} />
                          Edit
                        </button> */}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="card-body items-center text-center py-16">
                <div className="avatar avatar-placeholder">
                  <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center shadow-md">
                    <Bot className="w-12 h-12 text-primary" />
                  </div>
                </div>
                <h2 className="card-title text-2xl mt-6 mb-2">
                  No Assistants Yet
                </h2>
                <p className="text-base-content/70 max-w-md mb-8">
                  Create your first assistant to start building your AI voice
                  assistant experience.
                </p>

                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <Sparkles size={20} />
                  Create Your First Assistant
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isCreateModalOpen && (
        <dialog open className="modal">
          <div className="modal-box bg-base-300/60 backdrop-blur-2xl border-2 border-primary/30 shadow-xl max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="text-primary" size={18} />
                <h2 className="font-bold text-lg">Create New Assistant</h2>
              </div>
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => setIsCreateModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-base-content/70 mb-4">
              Configure your AI assistant in 3 simple steps
            </p>

            <div className="w-full bg-base-100/30 h-1.5 mb-6 rounded-full">
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
                        ? "bg-success/20 text-success border border-success/40"
                        : step === index + 1
                        ? "bg-primary/20 text-primary border border-primary/40"
                        : "bg-base-300/30 text-base-content/70 border border-base-100/20"
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
                    className="input input-bordered w-full"
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
                      className="input input-bordered w-full"
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
                      className="textarea textarea-bordered min-h-[150px] w-full"
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
                    className="input input-bordered w-full"
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
                className="btn btn-outline btn-sm"
                onClick={handleBack}
                disabled={step === 1}
              >
                <ChevronLeft size={16} />
                Back
              </button>

              <div className="flex items-center gap-3">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </button>

                {step < 3 ? (
                  <button
                    className="btn btn-primary btn-sm"
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
                    className="btn btn-primary btn-sm"
                    onClick={handleCreateAssistant}
                    disabled={createLoading || !formData.endCallMessage}
                  >
                    {createLoading ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Creating...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        Create Assistant
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          <form
            method="dialog"
            className="modal-backdrop"
            onClick={() => {
              setIsCreateModalOpen(false);
            }}
          >
            <button>close</button>
          </form>
        </dialog>
      )}

      {isEditModalOpen && (
        <dialog open className="modal">
          <div className="modal-box bg-base-300/60 backdrop-blur-2xl border-2 border-primary/30 shadow-xl max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Edit3 className="text-primary" size={18} />
                <h2 className="font-bold text-lg">Edit Assistant</h2>
              </div>
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => setIsEditModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="py-4 space-y-6">
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
                  className="input input-bordered w-full"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    First Message
                  </span>
                  <span className="label-text-alt text-error">Required</span>
                </label>
                <input
                  type="text"
                  placeholder="Hello! How can I assist you today?"
                  value={formData.firstMessage}
                  onChange={(e) =>
                    handleInputChange("firstMessage", e.target.value)
                  }
                  className="input input-bordered w-full"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    System Prompt
                  </span>
                  <span className="label-text-alt text-error">Required</span>
                </label>
                <textarea
                  placeholder="You are a helpful assistant that..."
                  value={formData.systemPrompt}
                  onChange={(e) =>
                    handleInputChange("systemPrompt", e.target.value)
                  }
                  className="textarea textarea-bordered min-h-[150px] w-full"
                ></textarea>
              </div>

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
                  className="input input-bordered w-full"
                />
              </div>
            </div>

            <div className="divider my-2"></div>

            <div className="flex justify-end items-center mt-6">
              <div className="flex items-center gap-3">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleUpdateAssistant}
                  disabled={
                    updateLoading === currentAssistantId ||
                    !formData.name ||
                    !formData.firstMessage ||
                    !formData.systemPrompt ||
                    !formData.endCallMessage
                  }
                >
                  {updateLoading === currentAssistantId ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      Update Assistant
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <form
            method="dialog"
            className="modal-backdrop"
            onClick={() => {
              setIsEditModalOpen(false);
            }}
          >
            <button>close</button>
          </form>
        </dialog>
      )}

      {isDeleteModalOpen && (
        <dialog open className="modal">
          <div className="modal-box bg-base-300/60 backdrop-blur-2xl border-2 border-error/30 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-error" size={18} />
                <h2 className="font-bold text-lg">Confirm Deletion</h2>
              </div>
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <p className="py-4">
              Are you sure you want to delete this assistant? This action cannot
              be undone.
            </p>

            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-error"
                onClick={handleDeleteAssistant}
                disabled={deleteLoading === currentAssistantId}
              >
                {deleteLoading === currentAssistantId ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>

          <form
            method="dialog"
            className="modal-backdrop"
            onClick={() => {
              setIsDeleteModalOpen(false);
            }}
          >
            <button>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}
