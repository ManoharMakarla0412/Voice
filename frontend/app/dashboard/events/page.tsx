"use client"

import { useState } from "react"
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css" // Import the CSS
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"

export default function Home() {
  const [start, setStart] = useState(new Date())
  const [end, setEnd] = useState(new Date())
  const [eventName, setEventName] = useState("")
  const [eventDescription, setEventDescription] = useState("")

  const session = useSession()
  const supabase = useSupabaseClient()

  async function googleSignIn() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        scopes: "https://www.googleapis.com/auth/calendar",
      },
    })
    if (error) {
      alert("Error logging in to Google provider with Supabase")
      console.log(error)
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function createCalendarEvent() {
    console.log("Creating calendar event")
    const event = {
      summary: eventName,
      description: eventDescription,
      start: {
        dateTime: start.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: end.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    }
    if (session) {
      await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + session.provider_token,
        },
        body: JSON.stringify(event),
      })
        .then((data) => {
          return data.json()
        })
        .then((data) => {
          console.log(data)
          alert("Event created, check your Google Calendar!")
        })
    } else {
      alert("No active session. Please sign in.")
    }
  }

  return (
    <div className="min-h-screen bg-[#1C1C1C] rounded-md text-gray-300 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {session ? `Welcome, ${session.user.email}` : "Google Calendar Integration"}
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
                  className="w-full p-2 border rounded"
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
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventName">Event name</Label>
                <Input
                  id="eventName"
                  type="text"
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="Enter event name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventDescription">Event description</Label>
                <Input
                  id="eventDescription"
                  type="text"
                  onChange={(e) => setEventDescription(e.target.value)}
                  placeholder="Enter event description"
                />
              </div>
              <div className="space-y-2 pt-4">
                <Button onClick={() => createCalendarEvent()} className="w-full border border-gray-300">
                  Create Calendar Event
                </Button>
                <Button onClick={() => signOut()} variant="outline" className="w-full border border-gray-300">
                  Sign Out
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => googleSignIn()} className="w-full border border-gray-300">
              Sign In With Google
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}