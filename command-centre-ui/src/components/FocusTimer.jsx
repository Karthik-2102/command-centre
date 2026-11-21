import React, { useState, useEffect, useRef } from "react";
import { Timer, Play, Pause, RotateCcw, CheckCircle, Flame, X, Clock, Sparkles } from "lucide-react";
import Button from "./ui/Button";
import api from "../api/axios";

export default function FocusTimer({ onSessionLogged }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("pomodoro"); // "pomodoro" | "stopwatch"
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(25 * 60); // default 25 min
  const [initialPomodoroSeconds, setInitialPomodoroSeconds] = useState(25 * 60);
  const [showLogModal, setShowLogModal] = useState(false);

  // Form states for logging
  const [topic, setTopic] = useState("Spring Boot & Java");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        if (mode === "pomodoro") {
          setSeconds((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              setIsRunning(false);
              setShowLogModal(true);
              return 0;
            }
            return prev - 1;
          });
        } else {
          setSeconds((prev) => prev + 1);
        }
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, mode]);

  const toggleRun = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    if (mode === "pomodoro") {
      setSeconds(initialPomodoroSeconds);
    } else {
      setSeconds(0);
    }
  };

  const setPomodoroDuration = (mins) => {
    setIsRunning(false);
    setInitialPomodoroSeconds(mins * 60);
    setSeconds(mins * 60);
  };

  const formatTime = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleFinishAndLog = () => {
    setIsRunning(false);
    setShowLogModal(true);
  };

  const submitStudySession = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      // Calculate elapsed hours
      let elapsedMinutes = 0;
      if (mode === "pomodoro") {
        elapsedMinutes = Math.max(1, Math.round((initialPomodoroSeconds - seconds) / 60));
      } else {
        elapsedMinutes = Math.max(1, Math.round(seconds / 60));
      }

      const hours = (elapsedMinutes / 60).toFixed(2);
      const today = new Date().toISOString().split("T")[0];

      await api.post("/calendar/sessions", {
        sessionDate: today,
        hours: parseFloat(hours),
        topic: topic || "Backend Engineering",
        notes: notes.trim() || `Focus session (${elapsedMinutes} mins)`,
      });

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setShowLogModal(false);
        resetTimer();
        if (onSessionLogged) onSessionLogged();
      }, 1200);
    } catch (err) {
      console.error("Failed to log study session:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Trigger Pill in Header */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          title="Open Focus Timer"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-medium transition-all duration-200 ${
            isRunning
              ? "bg-neon-cyan/15 border-neon-cyan text-neon-cyan shadow-[0_0_15px_rgba(0,240,255,0.25)] animate-pulse"
              : "bg-dark-card/80 border-dark-border text-gray-300 hover:border-neon-cyan/40 hover:text-white"
          }`}
        >
          <Timer className="w-3.5 h-3.5" />
          <span>{formatTime(seconds)}</span>
          {isRunning && (
            <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-ping" />
          )}
        </button>

        {/* Floating Dropdown / Popover */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-[#0d121d] border border-[#1e293b] p-4 shadow-[0_25px_60px_rgba(0,0,0,0.95)] z-50 animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Study Focus Engine
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Selector */}
            <div className="grid grid-cols-2 gap-1.5 bg-[#080c14] p-1 rounded-xl my-3 border border-[#1e293b]">
              <button
                type="button"
                onClick={() => {
                  setMode("pomodoro");
                  setPomodoroDuration(25);
                }}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  mode === "pomodoro"
                    ? "bg-gradient-to-r from-teal-500/20 to-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Pomodoro
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("stopwatch");
                  setIsRunning(false);
                  setSeconds(0);
                }}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  mode === "stopwatch"
                    ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Stopwatch
              </button>
            </div>

            {/* Pomodoro presets */}
            {mode === "pomodoro" && (
              <div className="flex items-center justify-center gap-1.5 mb-3">
                {[15, 25, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setPomodoroDuration(mins)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all ${
                      initialPomodoroSeconds === mins * 60
                        ? "border-emerald-500/60 text-emerald-400 bg-emerald-500/15 shadow-[0_0_10px_rgba(16,185,129,0.25)] font-bold"
                        : "border-[#1e293b] text-gray-400 hover:text-white bg-[#0b1017]"
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            )}

            {/* Big Digits Display */}
            <div className="py-4 text-center">
              <div className="text-4xl font-mono font-extrabold tracking-wider text-white">
                {formatTime(seconds)}
              </div>
              <p className="text-[11px] font-mono text-gray-400 mt-1">
                {mode === "pomodoro" ? "Focus Sprint Countdown" : "Elapsed Focus Time"}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={resetTimer}
                title="Reset Sprint"
                className="p-2.5 rounded-xl border border-[#1e293b] bg-[#0b1017] text-gray-400 hover:text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/10 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={toggleRun}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 ${
                  isRunning
                    ? "bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.35)]"
                    : "bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:from-emerald-300 hover:to-teal-400 text-emerald-950 shadow-[0_0_20px_rgba(16,185,129,0.35)]"
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4 fill-current text-white" />
                    <span>Pause Sprint</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current text-emerald-950" />
                    <span>Start Focus</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleFinishAndLog}
                title="Finish & Save Session"
                className="p-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Log Study Session Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#0d121d] border border-[#1e293b] rounded-2xl p-6 shadow-2xl relative animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
              <div className="flex items-center gap-2 text-emerald-400">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-bold text-sm text-white">Log Study Session</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={submitStudySession} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1.5">
                  Subject / Topic
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b1017] border border-[#1e293b] text-sm text-white hover:border-emerald-500/40 focus:outline-none focus:border-emerald-400 font-mono"
                >
                  <option value="Java Fundamentals">Java Fundamentals</option>
                  <option value="OOP & Java Collections">OOP & Java Collections</option>
                  <option value="DSA & Problem Solving">DSA & Problem Solving</option>
                  <option value="Spring Boot Architecture">Spring Boot Architecture</option>
                  <option value="PostgreSQL & SQL">PostgreSQL & SQL</option>
                  <option value="Docker & Deployment">Docker & Deployment</option>
                  <option value="System Design">System Design</option>
                  <option value="Interview Preparation">Interview Preparation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1.5">
                  Notes & Accomplishments
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What concepts did you master or build during this session?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b1017] border border-[#1e293b] text-sm text-white hover:border-emerald-500/40 focus:outline-none focus:border-emerald-400"
                />
              </div>

              {saveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 text-center font-mono flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Session successfully saved to PostgreSQL!</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#1e293b] text-xs text-gray-400 hover:text-white bg-[#0b1017]"
                >
                  Discard
                </button>
                <Button type="submit" loading={saving} variant="emerald" className="flex-1">
                  <span>Save to Database</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
