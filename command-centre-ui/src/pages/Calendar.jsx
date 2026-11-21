import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Layers,
  X,
  Trash2,
  Sparkles,
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Spinner from "../components/ui/Spinner";
import api from "../api/axios";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [events, setEvents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);

  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    eventType: "STUDY",
    eventDate: new Date().toISOString().split("T")[0],
    startTime: "10:00",
    endTime: "12:00",
  });

  const [sessionForm, setSessionForm] = useState({
    sessionDate: new Date().toISOString().split("T")[0],
    hours: "3.0",
    topic: "Java OOP & Collections",
    notes: "",
  });

  useEffect(() => {
    fetchCalendarData();
  }, [currentDate]);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      // Range for current month +/- 7 days for calendar overflow
      const start = new Date(year, month, -6).toISOString().split("T")[0];
      const end = new Date(year, month + 1, 10).toISOString().split("T")[0];

      const [evRes, seRes] = await Promise.allSettled([
        api.get("/calendar/events", { params: { start, end } }),
        api.get("/calendar/sessions", { params: { start, end } }),
      ]);

      if (evRes.status === "fulfilled" && evRes.value.data?.success) {
        setEvents(evRes.value.data.data);
      } else {
        setEvents(mockEvents);
      }

      if (seRes.status === "fulfilled" && seRes.value.data?.success) {
        setSessions(seRes.value.data.data);
      } else {
        setSessions(mockSessions);
      }
    } catch (err) {
      setEvents(mockEvents);
      setSessions(mockSessions);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today.toISOString().split("T")[0]);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!eventForm.title.trim()) return;

    try {
      const res = await api.post("/calendar/events", eventForm);
      if (res.data?.success && res.data?.data) {
        setEvents((prev) => [...prev, res.data.data]);
      }
    } catch (err) {
      setEvents((prev) => [
        ...prev,
        { id: Date.now(), ...eventForm, isCompleted: false },
      ]);
    } finally {
      setIsEventModalOpen(false);
    }
  };

  const handleSaveSession = async (e) => {
    e.preventDefault();
    if (!sessionForm.hours) return;

    try {
      const res = await api.post("/calendar/sessions", {
        ...sessionForm,
        hours: parseFloat(sessionForm.hours),
      });
      if (res.data?.success && res.data?.data) {
        setSessions((prev) => [...prev, res.data.data]);
      }
    } catch (err) {
      setSessions((prev) => [
        ...prev,
        {
          id: Date.now(),
          ...sessionForm,
          hours: parseFloat(sessionForm.hours),
        },
      ]);
    } finally {
      setIsSessionModalOpen(false);
    }
  };

  const handleToggleEvent = async (eventId) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId ? { ...e, isCompleted: !e.isCompleted } : e
      )
    );
    try {
      await api.patch(`/calendar/events/${eventId}/toggle`);
    } catch (err) {
      // Ignored in mock
    }
  };

  const handleDeleteEvent = async (eventId) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    try {
      await api.delete(`/calendar/events/${eventId}`);
    } catch (err) {
      // Ignored in mock
    }
  };

  // Build Month Calendar Days Matrix
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays = [];

  // Prev month padding
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const dateStr = new Date(year, month - 1, d).toISOString().split("T")[0];
    calendarDays.push({ day: d, dateStr, isCurrentMonth: false });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      d
    ).padStart(2, "0")}`;
    calendarDays.push({ day: d, dateStr, isCurrentMonth: true });
  }

  // Next month padding to complete 35 or 42 cells
  const remaining = (7 - (calendarDays.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const dateStr = new Date(year, month + 1, d).toISOString().split("T")[0];
    calendarDays.push({ day: d, dateStr, isCurrentMonth: false });
  }

  const todayStr = new Date().toISOString().split("T")[0];

  const selectedDayEvents = events.filter((e) => e.eventDate === selectedDate);
  const selectedDaySessions = sessions.filter(
    (s) => s.sessionDate === selectedDate
  );
  const selectedDayTotalHours = selectedDaySessions.reduce(
    (sum, s) => sum + (parseFloat(s.hours) || 0),
    0
  );

  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const eventTypeColors = {
    STUDY: "bg-neon-cyan/20 border-neon-cyan/40 text-neon-cyan",
    TASK: "bg-neon-purple/20 border-neon-purple/40 text-neon-purple",
    DEADLINE: "bg-red-500/20 border-red-500/40 text-red-400",
    INTERVIEW: "bg-amber-500/20 border-amber-500/40 text-amber-400",
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 text-neon-cyan font-mono text-xs uppercase tracking-wider mb-1">
            <CalendarIcon className="w-4 h-4" />
            <span>Time Scheduling & Sessions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Study Calendar
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Schedule focused study blocks, log actual daily hours, and track upcoming deadlines.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSessionForm({
                ...sessionForm,
                sessionDate: selectedDate,
              });
              setIsSessionModalOpen(true);
            }}
            className="gap-1.5"
          >
            <Clock className="w-4 h-4 text-neon-cyan" />
            <span>Log Study Hours</span>
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setEventForm({
                ...eventForm,
                eventDate: selectedDate,
              });
              setIsEventModalOpen(true);
            }}
            className="gap-1.5 shadow-glow-cyan"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Event</span>
          </Button>
        </div>
      </div>

      {/* Main Grid: Calendar on Left (2/3), Selected Day Inspector on Right (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Month Calendar Grid (2 Cols) */}
        <Card className="p-6 lg:col-span-2 space-y-4">
          {/* Calendar Controls */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white font-mono">{monthName}</h3>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-xl bg-dark-bg border border-dark-border text-gray-400 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleToday}
                className="px-3 py-1.5 rounded-xl bg-dark-bg border border-dark-border text-xs font-mono text-gray-300 hover:text-neon-cyan"
              >
                Today
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-xl bg-dark-bg border border-dark-border text-gray-400 hover:text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] text-gray-500 py-1 border-b border-dark-border/60">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Day Cells Grid */}
          <div className="grid grid-cols-7 gap-1.5 pt-1">
            {calendarDays.map((cell, idx) => {
              const isSelected = cell.dateStr === selectedDate;
              const isToday = cell.dateStr === todayStr;

              // Hours logged on this date
              const dayHours = sessions
                .filter((s) => s.sessionDate === cell.dateStr)
                .reduce((sum, s) => sum + (parseFloat(s.hours) || 0), 0);

              // Events on this date
              const dayEvs = events.filter((e) => e.eventDate === cell.dateStr);

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedDate(cell.dateStr)}
                  className={`min-h-[75px] sm:min-h-[85px] p-1.5 rounded-xl text-left border flex flex-col justify-between transition-all duration-200 relative focus:outline-none ${
                    isSelected
                      ? "bg-dark-card border-neon-cyan/70 shadow-glow-cyan"
                      : isToday
                      ? "bg-dark-card/90 border-neon-purple/50"
                      : cell.isCurrentMonth
                      ? "bg-dark-bg/60 border-dark-border/70 hover:border-gray-700 hover:bg-dark-card/40"
                      : "bg-dark-bg/20 border-transparent text-gray-700 opacity-40"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-mono font-semibold ${
                        isToday
                          ? "w-5 h-5 rounded-full bg-neon-cyan text-dark-bg flex items-center justify-center font-bold"
                          : isSelected
                          ? "text-neon-cyan font-bold"
                          : cell.isCurrentMonth
                          ? "text-gray-300"
                          : "text-gray-600"
                      }`}
                    >
                      {cell.day}
                    </span>

                    {dayHours > 0 && (
                      <span className="text-[10px] font-mono text-neon-cyan font-bold bg-neon-cyan/10 px-1 py-0.5 rounded">
                        {dayHours}h
                      </span>
                    )}
                  </div>

                  {/* Event indicator dots / chips */}
                  <div className="space-y-0.5 w-full mt-1 overflow-hidden">
                    {dayEvs.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className={`text-[9px] font-mono truncate px-1 py-0.5 rounded border leading-tight ${
                          eventTypeColors[ev.eventType] || eventTypeColors.STUDY
                        }`}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvs.length > 2 && (
                      <p className="text-[9px] text-gray-500 font-mono text-center">
                        +{dayEvs.length - 2} more
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Selected Date Inspector Panel (1 Col) */}
        <Card className="p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-dark-border/80 pb-3">
              <div>
                <span className="text-[10px] font-mono text-neon-cyan uppercase tracking-wider">
                  Day Inspector
                </span>
                <h4 className="text-base font-bold text-white font-mono mt-0.5">
                  {new Date(selectedDate + "T00:00:00").toLocaleDateString(
                    "en-US",
                    {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }
                  )}
                </h4>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-gray-500 uppercase">
                  Logged
                </span>
                <p className="text-xl font-bold text-neon-cyan font-mono">
                  {selectedDayTotalHours}h
                </p>
              </div>
            </div>

            {/* Scheduled Events Section */}
            <div className="space-y-2.5">
              <p className="text-xs font-mono uppercase tracking-wider text-gray-400">
                Scheduled Events ({selectedDayEvents.length})
              </p>

              {selectedDayEvents.length > 0 ? (
                <div className="space-y-2">
                  {selectedDayEvents.map((ev) => {
                    const isDone = ev.isCompleted;
                    return (
                      <div
                        key={ev.id}
                        className="p-3 rounded-xl bg-dark-bg/80 border border-dark-border flex items-start justify-between gap-3"
                      >
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                          <button
                            type="button"
                            onClick={() => handleToggleEvent(ev.id)}
                            className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                              isDone
                                ? "bg-emerald-500 border-emerald-500 text-dark-bg"
                                : "border-gray-500 hover:border-neon-cyan"
                            }`}
                          >
                            {isDone && <CheckCircle2 className="w-3 h-3" />}
                          </button>

                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-xs font-semibold truncate ${
                                isDone
                                  ? "line-through text-gray-500"
                                  : "text-gray-200"
                              }`}
                            >
                              {ev.title}
                            </p>
                            {ev.startTime && (
                              <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                                {ev.startTime} {ev.endTime ? `- ${ev.endTime}` : ""}
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteEvent(ev.id)}
                          className="text-gray-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-500 py-3 text-center border border-dashed border-dark-border/80 rounded-xl">
                  No events scheduled for this day.
                </p>
              )}
            </div>

            {/* Study Sessions Logged Section */}
            <div className="space-y-2.5 pt-2">
              <p className="text-xs font-mono uppercase tracking-wider text-gray-400">
                Study Logs ({selectedDaySessions.length})
              </p>

              {selectedDaySessions.length > 0 ? (
                <div className="space-y-2">
                  {selectedDaySessions.map((s) => (
                    <div
                      key={s.id}
                      className="p-3 rounded-xl bg-neon-cyan/5 border border-neon-cyan/20 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">
                          {s.topic || "Self Study"}
                        </span>
                        <span className="text-xs font-mono text-neon-cyan font-bold">
                          {s.hours} hrs
                        </span>
                      </div>
                      {s.notes && (
                        <p className="text-[11px] text-gray-400 leading-relaxed">
                          {s.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 py-3 text-center border border-dashed border-dark-border/80 rounded-xl">
                  No study hours logged yet.
                </p>
              )}
            </div>
          </div>

          {/* Quick Action Footer */}
          <div className="pt-4 border-t border-dark-border/80 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="w-full"
              onClick={() => {
                setSessionForm({
                  ...sessionForm,
                  sessionDate: selectedDate,
                });
                setIsSessionModalOpen(true);
              }}
            >
              + Log Hours
            </Button>
            <Button
              size="sm"
              className="w-full"
              onClick={() => {
                setEventForm({
                  ...eventForm,
                  eventDate: selectedDate,
                });
                setIsEventModalOpen(true);
              }}
            >
              + Event
            </Button>
          </div>
        </Card>
      </div>

      {/* Log Study Session Modal */}
      {isSessionModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsSessionModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-dark-card border border-dark-border shadow-2xl p-6 space-y-4 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-dark-border/80 pb-3">
              <h3 className="text-base font-bold text-white">
                Log Completed Study Hours
              </h3>
              <button
                type="button"
                onClick={() => setIsSessionModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSession} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Session Date"
                  type="date"
                  value={sessionForm.sessionDate}
                  onChange={(e) =>
                    setSessionForm({
                      ...sessionForm,
                      sessionDate: e.target.value,
                    })
                  }
                  required
                />
                <Input
                  label="Hours (e.g. 3.0)"
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="16"
                  value={sessionForm.hours}
                  onChange={(e) =>
                    setSessionForm({ ...sessionForm, hours: e.target.value })
                  }
                  required
                />
              </div>

              <Input
                label="Topic / Subject Covered"
                placeholder="e.g. Java Collections, SQL Joins, Spring Data JPA..."
                value={sessionForm.topic}
                onChange={(e) =>
                  setSessionForm({ ...sessionForm, topic: e.target.value })
                }
                required
              />

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                  Session Notes & Breakthroughs
                </label>
                <textarea
                  rows={3}
                  placeholder="What concepts clicked? What problems were resolved?"
                  value={sessionForm.notes}
                  onChange={(e) =>
                    setSessionForm({ ...sessionForm, notes: e.target.value })
                  }
                  className="w-full p-3 rounded-xl text-xs bg-dark-bg/90 border border-dark-border text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan/50"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-dark-border/80">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsSessionModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Save Study Session
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Event Modal */}
      {isEventModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsEventModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-dark-card border border-dark-border shadow-2xl p-6 space-y-4 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-dark-border/80 pb-3">
              <h3 className="text-base font-bold text-white">
                Schedule Calendar Event
              </h3>
              <button
                type="button"
                onClick={() => setIsEventModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <Input
                label="Event Title"
                placeholder="e.g. Mock Interview, LeetCode Biweekly Contest..."
                value={eventForm.title}
                onChange={(e) =>
                  setEventForm({ ...eventForm, title: e.target.value })
                }
                autoFocus
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                    Event Type
                  </label>
                  <select
                    value={eventForm.eventType}
                    onChange={(e) =>
                      setEventForm({
                        ...eventForm,
                        eventType: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl text-xs bg-dark-bg/90 border border-dark-border text-gray-200 focus:outline-none focus:border-neon-cyan/50 font-mono"
                  >
                    <option value="STUDY">Study Session</option>
                    <option value="TASK">Task Deadline</option>
                    <option value="DEADLINE">College / Exam</option>
                    <option value="INTERVIEW">Technical Interview</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <Input
                  label="Event Date"
                  type="date"
                  value={eventForm.eventDate}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, eventDate: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Start Time"
                  type="time"
                  value={eventForm.startTime}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, startTime: e.target.value })
                  }
                />
                <Input
                  label="End Time"
                  type="time"
                  value={eventForm.endTime}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, endTime: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-dark-border/80">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEventModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Schedule Event
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Fallback seed events and sessions
const mockEvents = [
  {
    id: 1,
    title: "Java OOP Deep-Dive Block",
    eventType: "STUDY",
    eventDate: new Date().toISOString().split("T")[0],
    startTime: "10:00",
    endTime: "13:00",
    isCompleted: false,
  },
  {
    id: 2,
    title: "Weekly Review & Retrospective",
    eventType: "DEADLINE",
    eventDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    startTime: "18:00",
    endTime: "19:00",
    isCompleted: false,
  },
];

const mockSessions = [
  {
    id: 1,
    sessionDate: new Date().toISOString().split("T")[0],
    hours: 3.0,
    topic: "Java Fundamentals & Methods",
    notes: "Reviewed method recursion and stack memory allocation.",
  },
];
