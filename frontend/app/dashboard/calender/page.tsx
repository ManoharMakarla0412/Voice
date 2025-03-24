"use client";
import React, { useState } from "react";
import Link from "next/link";

const mockEvents = [
  {
    id: "1",
    title: "Twice event For two Days",
    start: "2025-01-03",
    end: "2025-01-04",
    color: "bg-primary",
  },
  {
    id: "2",
    title: "Lunch with Mr.Raw",
    start: "2025-01-08",
    color: "bg-info",
  },
  {
    id: "3",
    title: "Going For Party of Sahs",
    start: "2025-01-11",
    color: "bg-info",
  },
  {
    id: "4",
    title: "Learn ReactJs",
    start: "2025-01-13",
    color: "bg-success",
  },
  {
    id: "5",
    title: "Launching MaterialArt Angular",
    start: "2025-01-17",
    color: "bg-error",
  },
  {
    id: "6",
    title: "Research of making own Browser",
    start: "2025-01-19",
    end: "2025-01-21",
    color: "bg-primary",
  },
  {
    id: "7",
    title: "Learn Ionic",
    start: "2025-01-23",
    end: "2025-01-24",
    color: "bg-warning",
  },
];

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date("2025-01-10"));
  const [view, setView] = useState("month");

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add previous month's days
    for (let i = 0; i < firstDay.getDay(); i++) {
      const day = new Date(year, month, -i);
      days.unshift(day);
    }

    // Add current month's days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    // Add next month's days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  };

  const getWeekDays = (date: Date) => {
    const days = [];
    const sunday = new Date(date);
    sunday.setDate(date.getDate() - date.getDay());

    for (let i = 0; i < 7; i++) {
      days.push(
        new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + i)
      );
    }

    return days;
  };

  const getHours = () => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push(i);
    }
    return hours;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const formatMonthYear = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const getEventsForDate = (date: Date) => {
    return mockEvents.filter((event) => {
      const eventStart = new Date(event.start);
      const eventEnd = event.end ? new Date(event.end) : eventStart;
      return date >= eventStart && date <= eventEnd;
    });
  };

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
      <div className="grid grid-cols-7 border border-base-content/20 rounded-lg overflow-hidden">
        {weekDays.map((day) => (
          <div
            key={day}
            className="p-2 text-sm text-center text-base-content/70 border-b border-base-content/20 bg-base-300/50"
          >
            {day}
          </div>
        ))}
        {days.map((day, index) => {
          const events = getEventsForDate(day);
          const isOtherMonth = day.getMonth() !== currentDate.getMonth();
          const isToday = day.toDateString() === new Date().toDateString();

          return (
            <div
              key={index}
              className={`
                min-h-24 p-1 border-r border-b border-base-content/20 transition-colors duration-200
                ${
                  isOtherMonth
                    ? "opacity-50 bg-base-300/20"
                    : "hover:bg-base-300/40"
                }
                ${isToday ? "bg-base-300/60" : ""}
              `}
            >
              <div className="p-1 text-sm">{day.getDate()}</div>
              <div className="space-y-1">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className={`
                      text-xs p-1 rounded text-primary-content truncate transform transition-all duration-200 
                      hover:scale-105 hover:z-10 cursor-pointer ${event.color}
                    `}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const days = getWeekDays(currentDate);
    const hours = getHours();

    return (
      <div className="grid grid-cols-8 border border-base-content/20 rounded-lg overflow-hidden">
        <div className="p-2 text-sm text-center text-base-content/70 border-b border-r border-base-content/20 bg-base-300/50">
          Time
        </div>
        {days.map((day, index) => (
          <div
            key={index}
            className="p-2 text-sm text-center text-base-content/70 border-b border-r border-base-content/20 bg-base-300/50"
          >
            {formatDate(day)}
          </div>
        ))}
        {hours.map((hour) => (
          <React.Fragment key={hour}>
            <div className="p-2 text-sm text-base-content/70 border-r border-b border-base-content/20">
              {hour.toString().padStart(2, "0")}:00
            </div>
            {days.map((day, dayIndex) => (
              <div
                key={`${hour}-${dayIndex}`}
                className="border-r border-b border-base-content/20 p-1 transition-colors duration-200 hover:bg-base-300/40"
              >
                {getEventsForDate(day).map((event) => {
                  const eventDate = new Date(event.start);
                  if (eventDate.getHours() === hour) {
                    return (
                      <div
                        key={event.id}
                        className={`text-xs p-1 rounded-sm text-primary-content transform transition-all duration-200 hover:scale-105 ${event.color}`}
                      >
                        {event.title}
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderDayView = () => {
    const hours = getHours();

    return (
      <div className="grid grid-cols-1 gap-px">
        {hours.map((hour) => (
          <div
            key={hour}
            className="grid grid-cols-[100px_1fr] border-t border-base-content/20"
          >
            <div className="p-2 text-sm text-base-content/70">
              {hour.toString().padStart(2, "0")}:00
            </div>
            <div className="p-1">
              {getEventsForDate(currentDate).map((event) => {
                const eventDate = new Date(event.start);
                if (eventDate.getHours() === hour) {
                  return (
                    <div
                      key={event.id}
                      className={`text-xs p-1 rounded-sm text-primary-content ${event.color}`}
                    >
                      {event.title}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAgendaView = () => {
    return (
      <div className="space-y-1">
        {mockEvents.map((event) => (
          <div
            key={event.id}
            className="grid grid-cols-[200px_1fr] p-2 border-t border-base-content/20"
          >
            <div className="text-sm text-base-content/70">
              {new Date(event.start).toLocaleDateString()}{" "}
              {event.end && `- ${new Date(event.end).toLocaleDateString()}`}
            </div>
            <div
              className={`text-sm p-1 rounded-sm text-primary-content ${event.color}`}
            >
              {event.title}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-base-100">
      <div className="flex items-center gap-2 p-4 text-sm">
        <Link href="/" className="text-primary hover:text-primary-focus">
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
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </Link>
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
          className="text-base-content/40"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span>Calendar</span>
      </div>

      <div className="p-4 max-w-[1400px] mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Calendar</h1>

        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <button
                  className="btn btn-outline"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Today
                </button>
                <div className="flex items-center gap-1">
                  <button
                    className="btn btn-outline btn-square btn-sm"
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
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <button
                    className="btn btn-outline btn-square btn-sm"
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
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
                <div className="font-medium ml-2">
                  {formatMonthYear(currentDate)}
                </div>
              </div>

              <div className="join">
                {["month", "week", "day", "agenda"].map((v) => (
                  <button
                    key={v}
                    className={`join-item btn ${
                      view === v ? "btn-active" : "btn-outline"
                    }`}
                    onClick={() => setView(v)}
                  >
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              {view === "month" && renderMonthView()}
              {view === "week" && renderWeekView()}
              {view === "day" && renderDayView()}
              {view === "agenda" && renderAgendaView()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
