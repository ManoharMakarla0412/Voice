"use client";
import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  LayoutGrid,
  List,
  Calendar as CalendarViewIcon,
  ListFilter,
  UserCircle,
  Phone,
  CheckCircle,
  XCircle,
  File,
  MessageSquare,
} from "lucide-react";

// // Define Socket.IO URL and path
// const SOCKET_URL = "https://osaw.in"; // Base URL
// const SOCKET_PATH = "/v1/voice/socket.io"; // Matches backend deployment

const SOCKET_URL = "https://osaw.in/v1/voice"; // Correct base URL
const SOCKET_PATH = "/socket.io"; // Matches server's default Socket.IO path
interface Event {
  id: string;
  title: string;
  start: string;
  end?: string;
  color: string;
  description: string;
  patientName: string;
  patientId: string;
  appointmentType: string;
  status: "scheduled" | "completed" | "cancelled";
  phoneNumber: string;
  isNewPatient: boolean;
}

interface AppointmentData {
  callId: string;
  problem: string;
  fullName: string;
  appointmentDateTime: string;
  duration: number;
  status: "scheduled" | "completed" | "cancelled";
}

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date("2025-01-10"));
  const [view, setView] = useState<"month" | "week" | "day" | "agenda">("month");
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);

  // Initialize Socket.IO with fallback to polling
  const socket = io(SOCKET_URL, {
    path: SOCKET_PATH,
    withCredentials: true,
    transports: ["websocket", "polling"], // Allow fallback to polling
    reconnection: true, // Attempt to reconnect on failure
    reconnectionAttempts: 5, // Number of reconnection attempts
    reconnectionDelay: 1000, // Delay between attempts
  });

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Socket.IO connected to", SOCKET_URL + SOCKET_PATH);
    });

    socket.on("appointmentCreated", (appointmentData: AppointmentData) => {
      console.log("Received appointmentCreated:", appointmentData);
      const newEvent: Event = {
        id: appointmentData.callId,
        title: `${appointmentData.problem} - ${appointmentData.fullName}`,
        start: appointmentData.appointmentDateTime,
        end: new Date(
          new Date(appointmentData.appointmentDateTime).getTime() +
            appointmentData.duration * 60000
        ).toISOString(),
        color: "bg-primary",
        description: appointmentData.problem,
        patientName: appointmentData.fullName,
        patientId: `PT-${Math.floor(Math.random() * 10000)}`,
        appointmentType: appointmentData.problem,
        status: appointmentData.status,
        phoneNumber: "(555) 000-0000",
        isNewPatient: false,
      };
      setEvents((prev) => [...prev, newEvent]);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error.message, error);
    });

    socket.on("reconnect_attempt", (attempt) => {
      console.log("Reconnection attempt:", attempt);
    });

    socket.on("reconnect_failed", () => {
      console.error("Socket.IO reconnection failed after all attempts");
    });

    return () => {
      socket.off("connect");
      socket.off("appointmentCreated");
      socket.off("connect_error");
      socket.off("reconnect_attempt");
      socket.off("reconnect_failed");
    };
  }, [socket]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.unshift(new Date(year, month, -i));
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }
    return days;
  };

  const getWeekDays = (date: Date) => {
    const days: Date[] = [];
    const sunday = new Date(date);
    sunday.setDate(date.getDate() - date.getDay());
    for (let i = 0; i < 7; i++) {
      days.push(
        new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + i)
      );
    }
    return days;
  };

  const getHours = () => Array.from({ length: 24 }, (_, i) => i);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(date);

  const formatMonthYear = (date: Date) =>
    new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(date);

  const getEventsForDate = (date: Date) =>
    events.filter((event) => {
      const eventStart = new Date(event.start);
      const eventEnd = event.end ? new Date(event.end) : eventStart;
      const compareDate = new Date(date).setHours(0, 0, 0, 0);
      const compareStart = new Date(eventStart).setHours(0, 0, 0, 0);
      const compareEnd = new Date(eventEnd).setHours(0, 0, 0, 0);
      return compareDate >= compareStart && compareDate <= compareEnd;
    });

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return (
      <div className="card bg-base-300/80 backdrop-blur-xl border-2 border-primary/30 shadow-lg overflow-hidden">
        <div className="card-body p-0">
          <div className="grid grid-cols-7 bg-primary/20 backdrop-blur-md">
            {weekDays.map((day) => (
              <div key={day} className="p-3 text-sm font-medium text-center">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day, index) => {
              const events = getEventsForDate(day);
              const isOtherMonth = day.getMonth() !== currentDate.getMonth();
              const isToday = day.toDateString() === new Date().toDateString();
              return (
                <div
                  key={index}
                  className={`min-h-28 p-1 border-b border-r border-base-200/50 transition-colors relative ${
                    isOtherMonth ? "bg-base-200/40" : "hover:bg-base-200/30"
                  } ${isToday ? "bg-primary/20 ring-1 ring-inset ring-primary/50" : ""}`}
                >
                  <div
                    className={`p-1 text-sm font-medium flex justify-center items-center w-6 h-6 rounded-full mb-1 shadow-sm ${
                      isToday
                        ? "bg-primary text-primary-content"
                        : isOtherMonth
                        ? "text-base-content/30"
                        : "text-base-content/90 bg-base-200/50"
                    }`}
                  >
                    {day.getDate()}
                  </div>
                  <div className="space-y-1 max-h-[80px] overflow-y-auto scrollbar-thin scrollbar-thumb-base-300/70 pr-1">
                    {events.map((event) => (
                      <div
                        key={event.id}
                        onClick={() => handleEventClick(event)}
                        className={`${event.color} text-xs p-1.5 rounded text-primary-content truncate shadow-md cursor-pointer transition-all duration-200 hover:translate-y-[-1px] hover:shadow-lg border border-white/20`}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const days = getWeekDays(currentDate);
    const hours = getHours();
    return (
      <div className="card bg-base-300/80 backdrop-blur-xl border-2 border-primary/30 shadow-lg overflow-hidden">
        <div className="card-body p-0">
          <div className="grid grid-cols-8 bg-primary/20 backdrop-blur-md">
            <div className="p-3 text-sm font-medium border-r border-base-200/50">
              Time
            </div>
            {days.map((day, index) => {
              const isToday = day.toDateString() === new Date().toDateString();
              return (
                <div
                  key={index}
                  className={`p-3 text-sm font-medium text-center ${isToday ? "bg-primary/20" : ""}`}
                >
                  <div className="font-medium">
                    {day.toLocaleDateString("en-US", { weekday: "short" })}
                  </div>
                  <div
                    className={`mt-1 text-lg font-bold flex justify-center items-center w-8 h-8 rounded-full mx-auto shadow-sm ${
                      isToday ? "bg-primary text-primary-content" : "bg-base-200/50"
                    }`}
                  >
                    {day.getDate()}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-base-300/70">
            {hours.map((hour) => (
              <div key={hour} className="grid grid-cols-8">
                <div className="p-2 text-sm font-medium text-base-content/90 border-r border-base-200/50 bg-base-200/30">
                  {hour.toString().padStart(2, "0")}:00
                </div>
                {days.map((day, dayIndex) => {
                  const isToday = day.toDateString() === new Date().toDateString();
                  return (
                    <div
                      key={`${hour}-${dayIndex}`}
                      className={`min-h-16 border-r border-b border-base-200/50 p-1 relative ${
                        isToday ? "bg-primary/10" : ""
                      } transition-colors duration-200 hover:bg-base-200/30`}
                    >
                      {getEventsForDate(day).map((event) => {
                        const eventDate = new Date(event.start);
                        if (eventDate.getHours() === hour) {
                          return (
                            <div
                              key={event.id}
                              onClick={() => handleEventClick(event)}
                              className={`${event.color} text-xs p-2 rounded-md shadow-md h-full text-primary-content transform transition-all duration-200 hover:translate-y-[-1px] hover:shadow-lg cursor-pointer border-l-4 border-l-white/30`}
                            >
                              <div className="font-medium">{event.title}</div>
                              <div className="text-primary-content/90 mt-1 text-[10px] flex items-center">
                                <Clock size={10} className="mr-1" />
                                {eventDate.getHours().toString().padStart(2, "0")}:
                                {eventDate.getMinutes().toString().padStart(2, "0")}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const hours = getHours();
    const events = getEventsForDate(currentDate);
    return (
      <div className="card bg-base-300/80 backdrop-blur-xl border-2 border-primary/30 shadow-lg overflow-hidden">
        <div className="card-body p-0">
          <div className="bg-primary/20 backdrop-blur-md p-4 text-center border-b border-base-200/50">
            <div className="text-lg font-medium">
              {formatDate(currentDate)} -{" "}
              {currentDate.toLocaleString("en-US", { weekday: "long" })}
            </div>
            <div className="text-sm text-base-content/90">
              {events.length} {events.length === 1 ? "event" : "events"} today
            </div>
          </div>
          <div className="overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-base-300/70">
            {hours.map((hour) => (
              <div
                key={hour}
                className="grid grid-cols-[80px_1fr] border-t border-base-200/50 relative"
              >
                <div className="p-2 text-sm font-medium text-base-content/90 bg-base-200/40 border-r border-base-200/50">
                  {hour.toString().padStart(2, "0")}:00
                </div>
                <div className="p-1 min-h-[60px] relative hover:bg-base-200/30 transition-colors">
                  {events
                    .filter((event) => new Date(event.start).getHours() === hour)
                    .map((event) => {
                      const eventDate = new Date(event.start);
                      const durationMinutes = event.end
                        ? (new Date(event.end).getTime() - eventDate.getTime()) /
                          (1000 * 60)
                        : 60;
                      const heightInPixels = Math.max((durationMinutes / 60) * 60, 30);
                      return (
                        <div
                          key={event.id}
                          onClick={() => handleEventClick(event)}
                          className={`${event.color} absolute rounded-md p-2 left-1 right-1 shadow-md border-l-4 border-l-white/30 cursor-pointer transition-transform hover:translate-y-[-1px] hover:shadow-lg`}
                          style={{ minHeight: `${heightInPixels}px`, zIndex: 10 }}
                        >
                          <div className="flex flex-col h-full">
                            <h3 className="font-medium text-primary-content text-sm line-clamp-1">
                              {event.title}
                            </h3>
                            {durationMinutes >= 45 && (
                              <p className="text-xs text-primary-content/90 mt-1 line-clamp-2">
                                {event.description}
                              </p>
                            )}
                            <div className="text-xs text-primary-content/90 mt-auto flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {eventDate.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderAgendaView = () => {
    const sortedEvents = [...events].sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    );
    return (
      <div className="card bg-base-300/80 backdrop-blur-xl border-2 border-primary/30 shadow-lg overflow-hidden">
        <div className="card-body p-0">
          <div className="bg-primary/20 backdrop-blur-md p-4 border-b border-base-200/50 flex justify-between items-center">
            <h3 className="font-medium">All Events ({sortedEvents.length})</h3>
            <div className="join">
              <button className="join-item btn btn-sm btn-ghost">
                <ListFilter size={16} />
              </button>
              <button className="join-item btn btn-sm btn-ghost">Today</button>
            </div>
          </div>
          <div className="divide-y divide-base-200/50">
            {sortedEvents.map((event) => {
              const startDate = new Date(event.start);
              const endDate = event.end ? new Date(event.end) : null;
              return (
                <div
                  key={event.id}
                  onClick={() => handleEventClick(event)}
                  className="p-4 hover:bg-base-200/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-center min-w-16">
                      <div className="text-2xl font-bold">{startDate.getDate()}</div>
                      <div className="text-xs text-base-content/90">
                        {startDate.toLocaleString("default", { month: "short" })}
                      </div>
                      <div className="text-xs mt-1 badge badge-sm badge-primary">
                        {startDate.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${event.color}`}></div>
                        <h3 className="font-medium text-base">{event.title}</h3>
                      </div>
                      <p className="text-sm text-base-content/90 mt-1 line-clamp-2">
                        {event.description}
                      </p>
                      {endDate && (
                        <div className="mt-2 text-xs text-base-content/90 flex items-center gap-1">
                          <Clock size={12} />
                          Until {endDate.toLocaleDateString()} at{" "}
                          {endDate.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderEventModal = () => {
    if (!showEventModal) return null;
    return (
      <dialog open className="modal">
        <div className="modal-box bg-base-300/95 backdrop-blur-xl border-2 border-primary/30 shadow-xl">
          <h3 className="font-bold text-xl flex items-center gap-2">
            {selectedEvent ? (
              <>
                <div className={`w-5 h-5 rounded-full ${selectedEvent.color}`}></div>
                {selectedEvent.title}
              </>
            ) : (
              <>
                <CalendarIcon className="text-primary" size={20} />
                New Appointment
              </>
            )}
          </h3>
          {selectedEvent && (
            <div className="py-4">
              <div className="card bg-base-200/40 shadow-sm mb-3">
                <div className="card-body p-3">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <UserCircle size={16} className="text-primary" />
                    Patient Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    <div>
                      <p className="text-sm font-medium">{selectedEvent.patientName}</p>
                      <p className="text-xs text-base-content/70">
                        ID: {selectedEvent.patientId}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs flex items-center gap-1">
                        <Phone size={14} />
                        {selectedEvent.phoneNumber}
                      </p>
                      {selectedEvent.isNewPatient && (
                        <span className="badge badge-sm badge-primary mt-1">
                          New Patient
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="card bg-base-200/40 shadow-sm mb-3">
                <div className="card-body p-3">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <CalendarIcon size={16} className="text-primary" />
                    Appointment Details
                  </h4>
                  <div className="flex items-center gap-2 mt-2">
                    <div
                      className={`badge ${
                        selectedEvent.status === "scheduled"
                          ? "badge-primary"
                          : selectedEvent.status === "completed"
                          ? "badge-success"
                          : "badge-error"
                      }`}
                    >
                      {selectedEvent.status}
                    </div>
                    <div className="badge badge-outline badge-ghost">
                      {selectedEvent.appointmentType}
                    </div>
                  </div>
                  <div className="bg-base-100/30 p-2 rounded-md mt-2">
                    <p className="text-xs flex items-center gap-1">
                      <Clock size={14} />
                      {new Date(selectedEvent.start).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}{" "}
                      {" · "}
                      {new Date(selectedEvent.start).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {selectedEvent.end &&
                        ` - ${new Date(selectedEvent.end).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}`}
                    </p>
                  </div>
                  <div className="mt-3">
                    <p className="text-xs text-base-content/90 font-medium">
                      Description:
                    </p>
                    <p className="text-sm mt-1">{selectedEvent.description}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <button className="btn btn-sm btn-outline flex-1 shadow-sm">
                  <CheckCircle size={16} /> Check In
                </button>
                <button className="btn btn-sm btn-error btn-outline flex-1 shadow-sm">
                  <XCircle size={16} /> Cancel
                </button>
              </div>
              <div className="flex gap-2 mt-2">
                <button className="btn btn-sm btn-ghost flex-1">
                  <File size={16} /> View Records
                </button>
                <button className="btn btn-sm btn-ghost flex-1">
                  <MessageSquare size={16} /> Send Reminder
                </button>
              </div>
            </div>
          )}
          <div className="modal-action">
            <button
              className="btn shadow-sm"
              onClick={() => {
                setShowEventModal(false);
                setSelectedEvent(null);
              }}
            >
              Close
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button
            onClick={() => {
              setShowEventModal(false);
              setSelectedEvent(null);
            }}
          >
            close
          </button>
        </form>
      </dialog>
    );
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="card bg-base-300/80 backdrop-blur-xl p-5 border-2 border-primary/30 shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <CalendarIcon className="h-6 w-6 text-primary" />
                Dental Appointments
              </h1>
              <p className="text-base-content/70 mt-1">
                Manage and schedule your patient appointments
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="join shadow-md">
                <button
                  className="join-item btn btn-sm"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Today
                </button>
                <button
                  className="join-item btn btn-sm btn-square"
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    if (view === "month") {
                      newDate.setMonth(newDate.getMonth() - 1);
                    } else if (view === "week") {
                      newDate.setDate(newDate.getDate() - 7);
                    } else {
                      newDate.setDate(newDate.getDate() - 1);
                    }
                    setCurrentDate(newDate);
                  }}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  className="join-item btn btn-sm btn-square"
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    if (view === "month") {
                      newDate.setMonth(newDate.getMonth() + 1);
                    } else if (view === "week") {
                      newDate.setDate(newDate.getDate() + 7);
                    } else {
                      newDate.setDate(newDate.getDate() + 1);
                    }
                    setCurrentDate(newDate);
                  }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
              <span className="badge badge-lg bg-base-200/60 font-medium shadow-sm">
                {formatMonthYear(currentDate)}
              </span>
              <button className="btn btn-primary btn-sm ml-auto shadow-md">
                <Plus size={16} />
                New Appointment
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <div className="join shadow-md">
            {[
              { id: "month" as const, icon: <LayoutGrid size={16} /> },
              { id: "week" as const, icon: <CalendarViewIcon size={16} /> },
              { id: "day" as const, icon: <List size={16} /> },
              { id: "agenda" as const, icon: <ListFilter size={16} /> },
            ].map((v) => (
              <button
                key={v.id}
                className={`join-item btn btn-sm ${
                  view === v.id ? "btn-primary" : "btn-ghost bg-base-200/50"
                }`}
                onClick={() => setView(v.id)}
              >
                {v.icon}
                <span className="capitalize">{v.id}</span>
              </button>
            ))}
          </div>
        </div>
        {view === "month" && renderMonthView()}
        {view === "week" && renderWeekView()}
        {view === "day" && renderDayView()}
        {view === "agenda" && renderAgendaView()}
      </div>
      {renderEventModal()}
    </div>
  );
};

export default Calendar;