"use client";

import { useState } from "react";
import { useSession, useSupabaseClient, useSessionContext } from "@supabase/auth-helpers-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { useToast } from "../../../components/ui/use-toast";
import { Toaster } from "../../../components/ui/toaster";

export default function Home() {
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  
  const session = useSession();
  const supabase = useSupabaseClient();
  const { isLoading } = useSessionContext();

  if (isLoading) {
    return <></>;
  }

  // Sign in with Google
  async function googleSignIn() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        scopes: "https://www.googleapis.com/auth/calendar"
      }
    });
    if (error) {
      toast({
        title: "Error Logging In",
        description: "Error logging in to Google provider with Supabase",
        variant: "destructive",
      });
      console.log(error);
    }
  }

  // Sign out
  async function signOut() {
    await supabase.auth.signOut();
    toast({
      title: "Signed Out",
      description: "Successfully signed out of your account",
      variant: "success",
    });
  }

  // Validate event data
  const validateEventData = () => {
    if (!eventName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter an event name",
        variant: "destructive",
      });
      return false;
    }

    if (start >= end) {
      toast({
        title: "Invalid Time",
        description: "End time must be after start time",
        variant: "destructive",
      });
      return false;
    }

    if (start < new Date()) {
      toast({
        title: "Invalid Date",
        description: "Cannot schedule events in the past",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  // Create Google Calendar Event
  async function createCalendarEvent() {
    if (!validateEventData()) return;

    setIsCreating(true);
    const event = {
      summary: eventName,
      description: eventDescription,
      start: {
        dateTime: start.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: end.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    };

    try {
      const response = await fetch("http://localhost:5000/api/events/create-event", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event,
          accessToken: session?.provider_token,
          userEmail: session?.user?.email
        })
      });

      const data = await response.json();
      console.log("Response: ", response);
      console.log("Data: ", data);
      if (!response.ok) {
        if (response.status === 409) {
          toast({
            title: "Time Slot Unavailable",
            description: "This time slot conflicts with existing events. Please choose another time.",
            variant: "destructive",
          });
        } else if (response.status === 401) {
          toast({
            title: "Authentication Error",
            description: "Please sign in again to continue",
            variant: "destructive",
          });
        } else {
          throw new Error(data.error || "Failed to create event");
        }
        return;
      }
      if(data.success){
        toast({
          title: "Success",
          description: "Event created successfully!",
          variant: "success",
        });
      }
      

      // Reset form
      setEventName("");
      setEventDescription("");
      setStart(new Date());
      setEnd(new Date());

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create event. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#1C1C1C] rounded-md text-gray-300 flex items-center justify-center p-4">
      <Toaster />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {session ? `Hey there ${session.user.email}` : "Google Calendar Integration"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {session ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="start">Start of your event</Label>
                <DatePicker
                  selected={start}
                  onChange={(date) => setStart(date || new Date())}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className="w-full p-2 border rounded bg-gray-800 text-white"
                  minDate={new Date()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end">End of your event</Label>
                <DatePicker
                  selected={end}
                  onChange={(date) => setEnd(date || new Date())}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className="w-full p-2 border rounded bg-gray-800 text-white"
                  minDate={start}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventName">Event name</Label>
                <Input
                  id="eventName"
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="Enter event name"
                  className="bg-gray-800 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventDescription">Event description</Label>
                <Input
                  id="eventDescription"
                  type="text"
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  placeholder="Enter event description"
                  className="bg-gray-800 text-white"
                />
              </div>
              <div className="space-y-2 pt-4">
                <Button 
                  onClick={createCalendarEvent} 
                  className="w-full border border-gray-300"
                  disabled={isCreating}
                >
                  {isCreating ? "Creating Event..." : "Create Calendar Event"}
                </Button>
                <Button 
                  onClick={signOut} 
                  variant="outline" 
                  className="w-full border border-gray-300"
                  disabled={isCreating}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={googleSignIn} className="w-full border border-gray-300">
              Sign In With Google
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}