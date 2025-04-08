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
  const [createLoading, setCreateLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const userId = sessionStorage.getItem("user_id");

  const fetchAssistants = async () => {
    if (!userId) {
      setError("User ID not found. Please log in again.");
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/assistant/getassitant/${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch assistants");
      }
      const data = await response.json();
      setAssistants(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch assistants");
      console.error("Error fetching assistants:", err);
    } finally {
      setLoading(false);
    }
  };

  const createAssistant = async (assistantData: any) => {
    if (!userId) {
      throw new Error("User ID not found. Please log in again.");
    }
    
    setCreateLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/assistant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...assistantData,
          userId: userId // Add userId from session storage
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create assistant");
      }

      const responseData = await response.json();
      
      // Add the new assistant to our local state
      setAssistants(prev => [...prev, responseData.assistant]);
      
      return responseData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error creating assistant:", errorMessage);
      setError(errorMessage);
      throw error;
    } finally {
      setCreateLoading(false);
    }
  };

  const updateAssistant = async (assistantId: string, updateData: any) => {
    setUpdateLoading(assistantId);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/assistant/${assistantId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update assistant");
      }
  
      const responseData = await response.json();
      
      // Update the assistant in our local state
      setAssistants(prev =>
        prev.map(assistant =>
          assistant.id === assistantId ? responseData.assistant : assistant
        )
      );
      
      return responseData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error updating assistant:", errorMessage);
      setError(errorMessage);
      throw error;
    } finally {
      setUpdateLoading(null);
    }
  };

  const deleteAssistant = async (assistantId: string) => {
    setDeleteLoading(assistantId);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/assistant/${assistantId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete assistant");
      }

      // Remove the deleted assistant from our local state
      setAssistants(prev => prev.filter(assistant => assistant.id !== assistantId));
      
      return await response.json();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error deleting assistant:", errorMessage);
      setError(errorMessage);
      throw error;
    } finally {
      setDeleteLoading(null);
    }
  };

  useEffect(() => {
    fetchAssistants();
  }, []);

  return {
    assistants,
    loading,
    createLoading,
    updateLoading,
    deleteLoading,
    error,
    fetchAssistants,
    createAssistant,
    updateAssistant,
    deleteAssistant,
  };
};

export default useAssistant;