"use client";

import { useState, useEffect } from "react";
import { BASE_URL } from "../../utils/constants";

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

  // Move fetchAssistants outside useEffect so it can be reused
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

      const data = await response.json();

      // Show success toast
      document.getElementById("success_toast")?.classList.remove("hidden");
      setTimeout(() => {
        document.getElementById("success_toast")?.classList.add("hidden");
      }, 3000);

      setIsModalOpen(false);
      setStep(1); // Reset step
      setFormData({
        name: "",
        firstMessage: "",
        systemPrompt: "",
        endCallMessage: "",
      }); // Reset form

      // Now we can refresh the assistants list
      fetchAssistants();
    } catch (error: any) {
      console.error("Error creating assistant:", error.message);

      // Show error toast
      document.getElementById("error_toast")?.classList.remove("hidden");
      setTimeout(() => {
        document.getElementById("error_toast")?.classList.add("hidden");
      }, 3000);
    }
  };

  const stepTooltips = [
    "Enter the assistant name.",
    "Provide the first message and system instructions.",
    "Set the end call message.",
  ];

  return (
    <div className="min-h-screen p-4 bg-base-300 rounded-md">
      <header className="sticky top-0 z-10 border-b border-base-content/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-primary">
            Assistant Dashboard
          </h1>
          <button
            className="btn btn-primary m-2"
            onClick={() => setIsModalOpen(true)}
          >
            Create Assistant
          </button>
        </div>
      </header>

      {/* Success Toast */}
      <div id="success_toast" className="toast toast-top toast-end hidden">
        <div className="alert alert-success">
          <span>Assistant created successfully!</span>
        </div>
      </div>

      {/* Error Toast */}
      <div id="error_toast" className="toast toast-top toast-end hidden">
        <div className="alert alert-error">
          <span>Failed to create assistant!</span>
        </div>
      </div>

      {/* Modal for creating assistants */}
      <dialog className={`modal ${isModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box bg-base-200">
          <h3 className="font-bold text-lg">Create New Assistant</h3>
          <p className="py-2 text-base-content/70">
            Follow the steps to configure your assistant.
          </p>

          {/* Timeline with tooltips */}
          <div className="flex items-center justify-center gap-4 my-4">
            {[1, 2, 3].map((currentStep, index) => (
              <div
                key={currentStep}
                className="relative flex items-center gap-2 group"
              >
                <div
                  className={`h-8 w-8 flex items-center justify-center rounded-full border-2 
                    ${
                      step >= currentStep
                        ? "bg-primary border-primary"
                        : "border-base-content/30"
                    }`}
                >
                  <span
                    className={`text-sm font-semibold 
                      ${
                        step >= currentStep
                          ? "text-primary-content"
                          : "text-base-content/50"
                      }`}
                  >
                    {currentStep}
                  </span>
                </div>
                {currentStep < 3 && (
                  <div
                    className={`h-1 w-8 ${
                      step > currentStep ? "bg-primary" : "bg-base-content/30"
                    }`}
                  ></div>
                )}

                {/* Tooltip */}
                <div
                  className="tooltip tooltip-bottom"
                  data-tip={stepTooltips[index]}
                >
                  <div className="w-2 h-2"></div>
                </div>
              </div>
            ))}
          </div>

          <div className="py-4">
            {step === 1 && (
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Assistant Name</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter assistant name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="input input-bordered w-full"
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">First Message</span>
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
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">System Prompt</span>
                  </label>
                  <textarea
                    placeholder="Enter the system instructions for the assistant..."
                    value={formData.systemPrompt}
                    onChange={(e) =>
                      handleInputChange("systemPrompt", e.target.value)
                    }
                    className="textarea textarea-bordered min-h-[150px] w-full"
                  ></textarea>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">End Call Message</span>
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
            )}
          </div>

          <div className="modal-action flex justify-between w-full">
            <button
              className="btn btn-outline"
              onClick={handleBack}
              disabled={step === 1}
            >
              Back
            </button>
            {step < 3 ? (
              <button className="btn btn-primary" onClick={handleNext}>
                Next
              </button>
            ) : (
              <button className="btn btn-primary" onClick={createAssistant}>
                Create
              </button>
            )}
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setIsModalOpen(false)}>close</button>
        </form>
      </dialog>

      {/* Display assistants */}
      {loading ? (
        <div className="flex justify-center items-center mt-8">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : error ? (
        <div className="alert alert-error mt-8 max-w-7xl mx-auto">
          <span>{error}</span>
        </div>
      ) : (
        <div className="mt-8 max-w-7xl mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {assistants.length > 0 ? (
            assistants.map((assistant) => (
              <div key={assistant.id} className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="card-title text-primary flex items-center justify-between">
                    {assistant.name}
                    <span className="text-sm text-base-content/60">
                      {new Date(assistant.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="space-y-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium">Model</label>
                      <p className="text-sm text-base-content/70">
                        {assistant.model.model}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        Provider
                      </label>
                      <p className="text-sm text-base-content/70">
                        {assistant.model.provider}
                      </p>
                    </div>
                    {assistant.firstMessage && (
                      <div>
                        <label className="block text-sm font-medium">
                          First Message
                        </label>
                        <p className="text-sm text-base-content/70">
                          {assistant.firstMessage}
                        </p>
                      </div>
                    )}
                    {assistant.endCallMessage && (
                      <div>
                        <label className="block text-sm font-medium">
                          End Call Message
                        </label>
                        <p className="text-sm text-base-content/70">
                          {assistant.endCallMessage}
                        </p>
                      </div>
                    )}
                    <button className="btn btn-outline w-full">
                      Edit Assistant
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center p-8">
              <p className="text-base-content/70">
                No assistants found. Create your first assistant!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

