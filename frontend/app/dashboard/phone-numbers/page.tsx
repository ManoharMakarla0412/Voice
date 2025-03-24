'use client'

import { useState, useEffect } from "react";
import { Phone, Trash2, Copy, ChevronDown, Check } from 'lucide-react';
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
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
  const [formData, setFormData] = useState({
    provider: "twilio",
    number: "",
    twilioAccountSid: "",
    twilioAuthToken: "",
    name: "",
  });

  useEffect(() => {
    Promise.all([
      fetchPhoneNumbers(),
      fetchAssistants()
    ]).finally(() => setIsLoading(false));
  }, []);

  const fetchAssistants = async () => {
    try {
      const response = await fetch(`${BASE_URL}/assistant/get`);
      if (!response.ok) throw new Error('Failed to fetch assistants');
      const data = await response.json();
      setAssistants(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch assistants');
    }
  };

  const fetchPhoneNumbers = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/phone/getphonenumbers`);
      if (!response.ok) throw new Error('Failed to fetch phone numbers');
      const data = await response.json();
      setPhoneNumbers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch phone numbers');
    }
  };

  const handleChange = (e: { target: { name: string; value: string; }; }) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAssistantChange = async (phoneId: string, assistantId: string) => {
    // Here you would implement the API call to update the assistant for this phone number
    console.log('Updating assistant:', { phoneId, assistantId });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}/api/phone/createphonenumber`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchPhoneNumbers();
        setShowImportModal(false);
      } else {
        const errorData = await response.json();
        setError(errorData.error);
      }
    } catch (error) {
      setError('An unexpected error occurred.');
    }
  };

  const handleDelete = async (id: string) => {
    // Implementation for delete functionality would go here
    console.log('Delete phone number:', id);
  };

  return (
    <div className="min-h-screen bg-[#1C1C1C] rounded-md text-gray-300 p-8">
      <div className="max-w-6xl mx-auto">
        {phoneNumbers.length === 0 && !isLoading ? (
          // Empty state
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col items-center text-center mb-12">
              <div className="w-16 h-16 mb-6">
                <Phone className="w-full h-full text-gray-400" />
              </div>
              <h1 className="text-2xl font-semibold text-white mb-4">Phone Numbers</h1>
              <p className="text-gray-400 mb-8">
                Assistants are able to be connected to phone numbers for calls.
              </p>
              <p className="text-gray-400 mb-8">
                You can import from Twilio, vonage, or by one directly from Vapi for use with your assistants.
              </p>
              <div className="flex gap-4 mb-4">
                <button 
                  onClick={() => setShowImportModal(true)}
                  className="px-6 py-2.5 bg-[#4FD1C5] text-white rounded-lg hover:bg-[#4FD1C5]/90 flex items-center gap-2"
                >
                  Import
                  <span className="text-xl">+</span>
                </button>
                <button className="px-6 py-2.5 text-gray-400 hover:text-white">
                  Documentation
                </button>
              </div>
              <div className="flex items-center gap-2 text-yellow-400 text-sm">
                <span className="text-lg">⚠</span>
                Please add <span className="underline">Card Details</span> to Buy a Number
              </div>
            </div>
          </div>
        ) : (
          // Phone numbers list
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-semibold text-white">Phone Numbers</h1>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowImportModal(true)}
                  className="px-4 py-2 bg-[#4FD1C5] text-white rounded-lg hover:bg-[#4FD1C5]/90 flex items-center gap-2"
                >
                  Import
                  <span className="text-xl">+</span>
                </button>
              </div>
            </div>

            {phoneNumbers.map((phone) => (
              <div key={phone.id} className="bg-[#1E1E1E] rounded-lg p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-white">{phone.number}</h2>
                    <p className="text-gray-400">{phone.name}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(phone.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex items-center gap-2 bg-[#141414] rounded-sm px-3 py-2 text-sm text-gray-400">
                  <span>{phone.id}</span>
                  <button className="ml-auto hover:text-white">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-[#141414] rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Inbound Settings</h3>
                  <p className="text-sm text-gray-400 mb-6">
                    You can assign an assistant to the Phone number so that whenever someone calls this phoneNumber the assistant will automatically be assigned to the call.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-400">Inbound Phone Number</Label>
                      <div className="flex bg-[#1E1E1E] rounded-sm border border-gray-800 mt-1">
                        <div className="px-3 py-2 border-r border-gray-800">🇺🇸</div>
                        <Input
                          value={phone.number}
                          disabled
                          className="flex-1 bg-transparent border-0 focus:ring-0"
                        />
                        <div className="px-2 py-2 text-green-500">✓</div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-gray-400">Assistant</Label>
                      <Select
                        value={phone.assistantId}
                        onValueChange={(value) => handleAssistantChange(phone.id, value)}
                      >
                        <SelectTrigger className="w-full mt-1 bg-[#1E1E1E] border-gray-800">
                          <SelectValue placeholder="Select Assistant" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1E1E1E] border-gray-800">
                          {assistants.map((assistant) => (
                            <SelectItem
                              key={assistant.id}
                              value={assistant.id}
                              className="text-gray-300 focus:bg-[#2A4B45] focus:text-[#4FD1C5]"
                            >
                              {assistant.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-gray-400">Squad</Label>
                      <div className="mt-1 p-4 bg-[#1E1E1E] border border-gray-800 rounded-sm">
                        <div className="flex items-center text-yellow-500 text-sm">
                          <span className="mr-2">⚠</span>
                          No squads available.{" "}
                          <button className="text-[#4FD1C5] ml-1">Create a squad</button>
                          {" "}to enable this feature.
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-gray-400">Fallback Destination</Label>
                      <p className="text-sm text-gray-400 mb-2">
                        Set a fallback destination for inbound calls when the assistant or squad is not available.
                      </p>
                      <div className="flex bg-[#1E1E1E] rounded-sm border border-gray-800">
                        <button className="px-3 py-2 border-r border-gray-800 flex items-center gap-2">
                          🇺🇸 <ChevronDown className="w-4 h-4" />
                        </button>
                        <Input
                          placeholder="Enter a phone number"
                          className="flex-1 bg-transparent border-0 focus:ring-0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-[#1E1E1E] rounded-xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Phone Number
            </h2>
            <p className="text-[14px] font-normal font-sans mb-4">Import Your Phone Number From Twilio</p>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* <div className="flex gap-2 bg-[#141414] p-1 rounded-lg">
                 <Button
                  type="button"
                  className={`flex-1 py-2 rounded-md text-sm ${
                    formData.provider === "twilio" ? "bg-[#4FD1C5] text-white" : "text-gray-400"
                  }`}
                >
                  Twilio
                </Button> 
                <Button
                  type="button"
                  className={`flex-1 py-2 rounded-md text-sm ${
                    formData.provider === "vonage" ? "bg-[#4FD1C5] text-white" : "text-gray-400"
                  }`}
                >
                  Vonage
                </Button>
              </div> */}

              <div className="space-y-2">
                <Label className="text-gray-400">Twilio Phone Number</Label>
                  <Input
                    type="text"
                    name="number"
                    value={formData.number}
                    onChange={handleChange}
                    className="w-full bg-[#141414] border border-gray-800 rounded-lg"
                    placeholder="+14156021922"
                  />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-400">Twilio Account SID</Label>
                <Input
                  type="text"
                  name="twilioAccountSid"
                  value={formData.twilioAccountSid}
                  onChange={handleChange}
                  className="w-full bg-[#141414] border border-gray-800 rounded-lg"
                  placeholder="Twilio Account SID"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-400">Twilio Auth Token</Label>
                <Input
                  type="password"
                  name="twilioAuthToken"
                  value={formData.twilioAuthToken}
                  onChange={handleChange}
                  className="w-full bg-[#141414] border border-gray-800 rounded-lg"
                  placeholder="Twilio Auth Token"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-400">Label</Label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-[#141414] border border-gray-800 rounded-lg"
                  placeholder="Label for Phone Number"
                />
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <Button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-6 py-2 text-gray-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="px-6 py-2 bg-[#4FD1C5] text-white rounded-lg hover:bg-[#4FD1C5]/90"
                >
                  Import from Twilio
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

