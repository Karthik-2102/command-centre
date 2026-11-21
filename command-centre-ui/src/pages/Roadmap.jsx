import React, { useState, useEffect } from "react";
import {
  Map,
  CheckCircle2,
  Clock,
  Circle,
  Calendar,
  FileText,
  Link as LinkIcon,
  Search,
  Filter,
  Edit3,
  X,
  Save,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Spinner from "../components/ui/Spinner";
import api from "../api/axios";
import { TOPIC_STATUS } from "../utils/constants";
import { formatDate } from "../utils/formatters";

export default function Roadmap() {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStageId, setSelectedStageId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal edit state
  const [editingTopic, setEditingTopic] = useState(null);
  const [editForm, setEditForm] = useState({
    status: "NOT_STARTED",
    notes: "",
    resources: "",
    startDate: "",
    completionDate: "",
  });
  const [savingTopic, setSavingTopic] = useState(false);

  useEffect(() => {
    fetchStages();
  }, []);

  const fetchStages = async () => {
    try {
      setLoading(true);
      const res = await api.get("/roadmap/stages");
      if (res.data?.success && res.data?.data && res.data.data.length > 0) {
        setStages(res.data.data);
        if (!selectedStageId) {
          setSelectedStageId(res.data.data[0].id);
        }
      } else {
        setStages(fallbackStages);
        if (!selectedStageId) setSelectedStageId(1);
      }
    } catch (err) {
      setStages(fallbackStages);
      if (!selectedStageId) setSelectedStageId(1);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (topic) => {
    setEditingTopic(topic);
    setEditForm({
      status: topic.status || "NOT_STARTED",
      notes: topic.notes || "",
      resources: topic.resources || "",
      startDate: topic.startDate || "",
      completionDate: topic.completionDate || "",
    });
  };

  const handleSaveTopic = async (e) => {
    e.preventDefault();
    if (!editingTopic) return;

    try {
      setSavingTopic(true);
      const res = await api.put(`/roadmap/topics/${editingTopic.id}`, editForm);

      if (res.data?.success && res.data?.data) {
        const updated = res.data.data;
        // Update local state
        setStages((prevStages) =>
          prevStages.map((stage) => {
            if (stage.id === editingTopic.stageId) {
              const updatedTopics = stage.topics.map((t) =>
                t.id === updated.id ? updated : t
              );
              const completedCount = updatedTopics.filter(
                (t) => t.status === "COMPLETED"
              ).length;
              const pct = Math.round((completedCount / updatedTopics.length) * 100);
              return {
                ...stage,
                topics: updatedTopics,
                completedTopics: completedCount,
                progressPercentage: pct,
              };
            }
            return stage;
          })
        );
      }
      setEditingTopic(null);
    } catch (err) {
      // If error or offline, update locally
      setStages((prevStages) =>
        prevStages.map((stage) => {
          if (stage.id === editingTopic.stageId) {
            const updatedTopics = stage.topics.map((t) =>
              t.id === editingTopic.id
                ? {
                    ...t,
                    ...editForm,
                    status: editForm.status,
                  }
                : t
            );
            return { ...stage, topics: updatedTopics };
          }
          return stage;
        })
      );
      setEditingTopic(null);
    } finally {
      setSavingTopic(false);
    }
  };

  const currentStage =
    stages.find((s) => s.id === selectedStageId) || stages[0] || null;

  const filteredTopics = currentStage?.topics?.filter((topic) => {
    const matchesSearch = topic.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || topic.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Spinner size="lg" color="cyan" />
        <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">
          Loading learning roadmap telemetry...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 text-neon-cyan font-mono text-xs uppercase tracking-wider mb-1">
          <Map className="w-4 h-4" />
          <span>Curriculum Telemetry</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Learning Roadmap
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          10-month progression spanning 6 stages and 51 specialized topics to reach job readiness.
        </p>
      </div>

      {/* Stage Selector Cards (Scrollable horizontal or grid) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stages.map((stage) => {
          const isSelected = stage.id === selectedStageId;
          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => setSelectedStageId(stage.id)}
              className={`p-3.5 rounded-2xl text-left border transition-all duration-300 relative overflow-hidden focus:outline-none ${
                isSelected
                  ? "bg-dark-card border-neon-cyan/60 shadow-glow-cyan"
                  : "bg-dark-card/60 border-dark-border hover:border-gray-700 hover:bg-dark-hover"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5 font-mono text-[10px]">
                <span className={isSelected ? "text-neon-cyan font-bold" : "text-gray-400"}>
                  Stage {stage.stageNumber}
                </span>
                <span className="text-gray-400">{stage.monthRange}</span>
              </div>

              <p className="text-xs font-bold text-white truncate">{stage.title}</p>

              {/* Progress bar */}
              <div className="w-full bg-dark-bg h-1.5 rounded-full mt-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-neon-cyan to-neon-purple h-full rounded-full transition-all duration-500"
                  style={{ width: `${stage.progressPercentage || 0}%` }}
                />
              </div>

              <p className="text-[10px] text-gray-400 font-mono mt-1 text-right">
                {stage.completedTopics || 0}/{stage.totalTopics || 0} ({stage.progressPercentage || 0}%)
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Stage Details Banner */}
      {currentStage && (
        <Card className="p-6 border-neon-cyan/30 shadow-glow-cyan bg-gradient-to-r from-dark-card via-dark-card to-dark-bg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-neon-cyan/15 border border-neon-cyan/30 text-neon-cyan text-xs font-mono">
                  Stage {currentStage.stageNumber} &bull; {currentStage.monthRange}
                </span>
                <span className="text-xs text-gray-400 font-mono">
                  {currentStage.completedTopics} of {currentStage.totalTopics} completed
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-white">
                {currentStage.title}
              </h3>
              <p className="text-xs text-gray-400 max-w-3xl leading-relaxed">
                {currentStage.description}
              </p>
            </div>

            <div className="shrink-0 text-left md:text-right">
              <span className="text-xs font-mono text-gray-400">Stage Progress</span>
              <p className="text-3xl font-extrabold text-neon-cyan font-mono">
                {currentStage.progressPercentage}%
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-cyan-400/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search topics in this stage..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-[#0b1017] border border-[#1e293b] text-gray-100 placeholder-gray-500 hover:border-cyan-500/40 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/40 focus:shadow-[0_0_15px_rgba(0,240,255,0.2)]"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
          {["ALL", "NOT_STARTED", "IN_PROGRESS", "COMPLETED"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors shrink-0 ${
                statusFilter === st
                  ? "bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan"
                  : "bg-dark-card/60 text-gray-400 border border-dark-border hover:text-white"
              }`}
            >
              {st === "ALL" ? "All Topics" : TOPIC_STATUS[st]?.label || st}
            </button>
          ))}
        </div>
      </div>

      {/* Topics List */}
      <div className="space-y-3">
        {filteredTopics && filteredTopics.length > 0 ? (
          filteredTopics.map((topic, idx) => {
            const statusConfig = TOPIC_STATUS[topic.status] || TOPIC_STATUS.NOT_STARTED;

            return (
              <Card
                key={topic.id}
                hoverable
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="mt-0.5">
                    {topic.status === "COMPLETED" ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : topic.status === "IN_PROGRESS" ? (
                      <Clock className="w-5 h-5 text-neon-cyan animate-pulse" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="text-sm font-bold text-white">{topic.title}</h4>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${statusConfig.bg} ${statusConfig.color} border-current/30`}
                      >
                        {statusConfig.label}
                      </span>
                    </div>

                    {/* Metadata: Dates, Notes excerpt */}
                    <div className="flex items-center gap-4 text-[11px] text-gray-500 font-mono flex-wrap pt-0.5">
                      {topic.startDate && (
                        <span>Started: {formatDate(topic.startDate)}</span>
                      )}
                      {topic.completionDate && (
                        <span className="text-emerald-400">
                          Completed: {formatDate(topic.completionDate)}
                        </span>
                      )}
                      {topic.resources && (
                        <span className="flex items-center gap-1 text-neon-cyan/80">
                          <LinkIcon className="w-3 h-3" />
                          <span>Resources Attached</span>
                        </span>
                      )}
                    </div>

                    {topic.notes && (
                      <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed bg-dark-bg/60 p-2 rounded-lg border border-dark-border/60">
                        {topic.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 self-end md:self-center">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleEditClick(topic)}
                    className="gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Update Progress</span>
                  </Button>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="p-8 text-center text-gray-500 text-sm">
            No topics matching your filter criteria.
          </Card>
        )}
      </div>

      {/* Edit Topic Modal */}
      {editingTopic && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setEditingTopic(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-dark-card border border-dark-border shadow-2xl p-6 space-y-5 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-dark-border/80 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-neon-cyan">
                  Update Topic Progress
                </span>
                <h3 className="text-base font-bold text-white mt-0.5 truncate max-w-md">
                  {editingTopic.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingTopic(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTopic} className="space-y-4">
              {/* Status Picker */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-2">
                  Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "NOT_STARTED", label: "Not Started" },
                    { id: "IN_PROGRESS", label: "In Progress" },
                    { id: "COMPLETED", label: "Completed" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setEditForm({ ...editForm, status: s.id })}
                      className={`p-2.5 rounded-xl text-xs font-mono font-medium border transition-colors ${
                        editForm.status === s.id
                          ? "bg-neon-cyan/20 border-neon-cyan text-neon-cyan shadow-glow-cyan"
                          : "bg-dark-bg/80 border-dark-border text-gray-400 hover:text-white"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Start Date"
                  type="date"
                  value={editForm.startDate}
                  onChange={(e) =>
                    setEditForm({ ...editForm, startDate: e.target.value })
                  }
                />
                <Input
                  label="Completion Date"
                  type="date"
                  value={editForm.completionDate}
                  onChange={(e) =>
                    setEditForm({ ...editForm, completionDate: e.target.value })
                  }
                />
              </div>

              {/* Personal Notes */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                  Personal Study Notes
                </label>
                <textarea
                  rows={4}
                  placeholder="Key concepts, syntax rules, edge cases, or code snippets..."
                  value={editForm.notes}
                  onChange={(e) =>
                    setEditForm({ ...editForm, notes: e.target.value })
                  }
                  className="w-full p-3 rounded-xl text-xs bg-dark-bg/90 border border-dark-border text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan/50 focus:shadow-glow-cyan"
                />
              </div>

              {/* Related Resources */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                  Related Resources / Documentation Links
                </label>
                <input
                  type="text"
                  placeholder="e.g. Oracle Docs, Spring Guides, Baeldung URL..."
                  value={editForm.resources}
                  onChange={(e) =>
                    setEditForm({ ...editForm, resources: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl text-xs bg-dark-bg/90 border border-dark-border text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan/50"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2.5 pt-2 border-t border-dark-border/80">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditingTopic(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  loading={savingTopic}
                  className="gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Progress</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Fallback roadmap seed data if backend is offline
const fallbackStages = [
  {
    id: 1,
    stageNumber: 1,
    title: "Java Fundamentals",
    description: "Core Java programming syntax, control structures, methods, arrays and strings.",
    monthRange: "Month 1",
    status: "IN_PROGRESS",
    progressPercentage: 28,
    totalTopics: 7,
    completedTopics: 2,
    topics: [
      { id: 1, stageId: 1, title: "Java Installation & Setup", status: "COMPLETED", startDate: "2026-11-01", completionDate: "2026-11-02", notes: "Installed JDK 21 and configured environment variables." },
      { id: 2, stageId: 1, title: "Variables & Data Types", status: "COMPLETED", startDate: "2026-11-03", completionDate: "2026-11-04", notes: "Primitives vs Reference types, byte/short/int/long/float/double/char/boolean." },
      { id: 3, stageId: 1, title: "Operators & Expressions", status: "IN_PROGRESS", startDate: "2026-11-05" },
      { id: 4, stageId: 1, title: "Input & Output", status: "NOT_STARTED" },
      { id: 5, stageId: 1, title: "Conditions & Loops", status: "NOT_STARTED" },
      { id: 6, stageId: 1, title: "Methods", status: "NOT_STARTED" },
      { id: 7, stageId: 1, title: "Arrays & Strings", status: "NOT_STARTED" },
    ],
  },
  {
    id: 2,
    stageNumber: 2,
    title: "OOP, Collections & DSA Basics",
    description: "Object-oriented principles, constructors, inheritance, polymorphism, Java Collections Framework.",
    monthRange: "Month 2",
    status: "NOT_STARTED",
    progressPercentage: 0,
    totalTopics: 9,
    completedTopics: 0,
    topics: [],
  },
  {
    id: 3,
    stageNumber: 3,
    title: "SQL, PostgreSQL & Git",
    description: "Relational database concepts, queries, joins, JDBC and Git version control workflows.",
    monthRange: "Month 3",
    status: "NOT_STARTED",
    progressPercentage: 0,
    totalTopics: 6,
    completedTopics: 0,
    topics: [],
  },
  {
    id: 4,
    stageNumber: 4,
    title: "Spring Boot",
    description: "RESTful architecture, Spring Data JPA, validation, security, testing and Postman.",
    monthRange: "Months 4–5",
    status: "NOT_STARTED",
    progressPercentage: 0,
    totalTopics: 12,
    completedTopics: 0,
    topics: [],
  },
  {
    id: 5,
    stageNumber: 5,
    title: "Professional Projects",
    description: "Building production-grade APIs, transactions, logging, Dockerization and deployment.",
    monthRange: "Months 6–7",
    status: "NOT_STARTED",
    progressPercentage: 0,
    totalTopics: 8,
    completedTopics: 0,
    topics: [],
  },
  {
    id: 6,
    stageNumber: 6,
    title: "Advanced Foundations",
    description: "System Design, Microservices, Redis caching, Kafka message streaming, interview mastery.",
    monthRange: "Months 8–10",
    status: "NOT_STARTED",
    progressPercentage: 0,
    totalTopics: 9,
    completedTopics: 0,
    topics: [],
  },
];
