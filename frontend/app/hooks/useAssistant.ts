// filepath: d:\voice\Voice\frontend\app\hooks\useAssistant.ts
import { useState, useEffect } from "react";
import { BASE_URL } from "../utils/constants";

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

const useAssistant = () => {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssistants = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/assistant`);
      if (!response.ok) {
        throw new Error("Failed to fetch assistants");
      }
      const data = await response.json();
      setAssistants(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch assistants");
    } finally {
      setLoading(false);
    }
  };

  const createAssistant = async (assistantData: any) => {
    setLoading(true);
    setError(null); // Reset error state
    try {
      const response = await fetch(`${BASE_URL}/assistant`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("auth_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(assistantData),
      });

      // Log raw response for debugging
      console.log("Create Assistant Response Status:", response.status);
      const responseText = await response.text();
      console.log("Create Assistant Response Text:", responseText);

      if (!response.ok) {
        const errorData = JSON.parse(responseText);
        throw new Error(errorData.error || "Failed to create assistant");
      }

      const newAssistant = JSON.parse(responseText);
      setAssistants((prev) => [...prev, newAssistant.assistant]); // Add the new assistant
      return newAssistant; // Return the full response for the caller
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error creating assistant:", errorMessage);
      setError(errorMessage);
      throw error; // Re-throw to let the caller handle it
    } finally {
      setLoading(false);
    }
  };

  const updateAssistant = async (assistantId: string, updateData: any) => {
    try {
      const response = await fetch(`${BASE_URL}/assistant/${assistantId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("auth_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update assistant");
      }
  
      const updatedAssistant = await response.json();
      setAssistants((prev) =>
        prev.map((assistant) =>
          assistant.id === assistantId ? updatedAssistant.assistant : assistant
        )
      );
      return updatedAssistant;
    } catch (error: any) {
      console.error("Error updating assistant:", error.message);
      setError(error.message);
      throw error;
    }
  };

  const deleteAssistant = async (assistantId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/assistant/${assistantId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("auth_token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete assistant");
      }

      setAssistants((prev) => prev.filter((assistant) => assistant.id !== assistantId));
    } catch (error: any) {
      console.error("Error deleting assistant:", error.message);
      throw error;
    }
  };

  useEffect(() => {
    fetchAssistants();
  }, []);

  return {
    assistants,
    loading,
    error,
    createAssistant,
    updateAssistant,
    deleteAssistant,
  };
};

export default useAssistant;