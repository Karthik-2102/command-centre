import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Plus,
  Search,
  Calendar,
  CheckCircle2,
  Clock,
  Building,
  GraduationCap,
  FileText,
  ChevronDown,
  ChevronUp,
  Edit3,
  Trash2,
  X,
  Target,
  ExternalLink,
  Sparkles,
  Award,
  Layers,
  ArrowRight,
  ArrowLeft,
  RotateCw,
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Spinner from "../components/ui/Spinner";
import api from "../api/axios";
import { JOB_STATUS } from "../utils/constants";
import { formatDate } from "../utils/formatters";

export default function CareerPrep() {
  const [activeTab, setActiveTab] = useState("applications"); // "applications" | "interview" | "resume"
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Interview Questions Category Subtab
  const [questionCategory, setQuestionCategory] = useState("java"); // "java" | "spring" | "sql" | "hr"
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [flashcardMode, setFlashcardMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Application Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppId, setEditingAppId] = useState(null);
  const [formData, setFormData] = useState({
    company: "",
    role: "Backend Developer",
    eligibility: "Online BCA, Java / Spring Boot stack",
    applicationDate: new Date().toISOString().split("T")[0],
    status: "APPLIED",
    followUpDate: "",
    notes: "",
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "applications") {
      fetchApplications();
    }
  }, [activeTab, statusFilter, searchQuery]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = {
        status: statusFilter,
        query: searchQuery,
      };
      const res = await api.get("/jobs", { params });
      if (res.data?.success && res.data?.data) {
        setApplications(res.data.data);
      } else {
        setApplications(mockApplications);
      }
    } catch (err) {
      setApplications(mockApplications);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingAppId(null);
    setFormData({
      company: "",
      role: "Junior Backend Developer",
      eligibility: "BCA / B.Tech / Equivalent, Java skills",
      applicationDate: new Date().toISOString().split("T")[0],
      status: "APPLIED",
      followUpDate: new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0],
      notes: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (app) => {
    setEditingAppId(app.id);
    setFormData({
      company: app.company,
      role: app.role,
      eligibility: app.eligibility || "",
      applicationDate: app.applicationDate || new Date().toISOString().split("T")[0],
      status: app.status || "APPLIED",
      followUpDate: app.followUpDate || "",
      notes: app.notes || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!formData.company.trim() || !formData.role.trim()) return;

    try {
      setFormLoading(true);
      if (editingAppId) {
        const res = await api.put(`/jobs/${editingAppId}`, formData);
        if (res.data?.success && res.data?.data) {
          setApplications((prev) =>
            prev.map((a) => (a.id === editingAppId ? res.data.data : a))
          );
        }
      } else {
        const res = await api.post("/jobs", formData);
        if (res.data?.success && res.data?.data) {
          setApplications((prev) => [res.data.data, ...prev]);
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      // Offline fallback
      if (editingAppId) {
        setApplications((prev) =>
          prev.map((a) => (a.id === editingAppId ? { ...a, ...formData } : a))
        );
      } else {
        const newApp = {
          id: Date.now(),
          ...formData,
          createdAt: new Date().toISOString(),
        };
        setApplications((prev) => [newApp, ...prev]);
      }
      setIsModalOpen(false);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteApplication = async (id) => {
    if (!window.confirm("Remove this job application?")) return;
    setApplications((prev) => prev.filter((a) => a.id !== id));
    try {
      await api.delete(`/jobs/${id}`);
    } catch (err) {
      // Ignored in mock
    }
  };

  const toggleQuestion = (index) => {
    setExpandedQuestions((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 text-neon-cyan font-mono text-xs uppercase tracking-wider mb-1">
            <Briefcase className="w-4 h-4" />
            <span>Job Readiness Suite</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Career Preparation
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Application pipeline tracking, technical interview vaults, and resume positioning.
          </p>
        </div>

        {activeTab === "applications" && (
          <Button
            onClick={handleOpenCreateModal}
            size="md"
            className="gap-2 shrink-0 shadow-glow-cyan"
          >
            <Plus className="w-4 h-4" />
            <span>Track Application</span>
          </Button>
        )}
      </div>

      {/* Primary Section Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-dark-card/80 border border-dark-border/80 w-full sm:w-max">
        {[
          { id: "applications", label: "Job Applications", icon: Briefcase },
          { id: "interview", label: "Interview Bank", icon: Target },
          { id: "resume", label: "Resume & Positioning", icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-neon-cyan text-dark-bg font-bold shadow-glow-cyan"
                  : "text-gray-400 hover:text-white hover:bg-dark-hover"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* TAB 1: JOB APPLICATIONS TRACKER                            */}
      {/* ─────────────────────────────────────────────────────────── */}
      {activeTab === "applications" && (
        <div className="space-y-6 animate-fade-in">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-dark-card/60 border border-dark-border/80">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-dark-bg/80 border border-dark-border overflow-x-auto">
              {[
                "ALL",
                "APPLIED",
                "IN_REVIEW",
                "INTERVIEW",
                "OFFERED",
                "REJECTED",
              ].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors shrink-0 ${
                    statusFilter === st
                      ? "bg-neon-cyan text-dark-bg font-bold shadow-glow-cyan"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {st === "ALL" ? "All" : JOB_STATUS[st]?.label || st}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-cyan-400/70 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search company or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-[#0b1017] border border-[#1e293b] text-gray-100 placeholder-gray-500 hover:border-cyan-500/40 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/40 focus:shadow-[0_0_15px_rgba(0,240,255,0.2)]"
              />
            </div>
          </div>

          {/* Applications List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="md" color="cyan" />
            </div>
          ) : applications.length > 0 ? (
            <div className="space-y-3.5">
              {applications.map((app) => {
                const statusConfig =
                  JOB_STATUS[app.status] || JOB_STATUS.APPLIED;

                return (
                  <Card
                    key={app.id}
                    hoverable
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <Building className="w-4 h-4 text-neon-cyan shrink-0" />
                        <h4 className="text-base font-bold text-white">
                          {app.company}
                        </h4>
                        <span className="text-xs text-gray-400">&bull;</span>
                        <span className="text-sm font-semibold text-gray-300">
                          {app.role}
                        </span>

                        <span
                          className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border border-current/30 ${statusConfig.color} bg-dark-bg`}
                        >
                          {statusConfig.label}
                        </span>
                      </div>

                      {app.eligibility && (
                        <p className="text-xs text-gray-400 font-mono">
                          Criteria: {app.eligibility}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-[11px] font-mono text-gray-500 pt-0.5 flex-wrap">
                        {app.applicationDate && (
                          <span>Applied: {formatDate(app.applicationDate)}</span>
                        )}
                        {app.followUpDate && (
                          <span className="text-amber-400 font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Follow-up: {formatDate(app.followUpDate)}</span>
                          </span>
                        )}
                      </div>

                      {app.notes && (
                        <p className="text-xs text-gray-300 bg-dark-bg/60 p-2.5 rounded-xl border border-dark-border/60 mt-1">
                          {app.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(app)}
                        className="p-2 rounded-xl text-gray-400 hover:text-neon-cyan hover:bg-dark-hover transition-colors"
                        title="Edit Application"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteApplication(app.id)}
                        className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete Application"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-12 text-center border-dashed border-dark-border space-y-3">
              <Briefcase className="w-8 h-8 text-gray-600 mx-auto" />
              <h4 className="text-sm font-semibold text-gray-300">
                No job applications found
              </h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Begin tracking positions you have targeted or applied to in Months 8–10 of your roadmap.
              </p>
            </Card>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* TAB 2: INTERVIEW QUESTION BANK                             */}
      {/* ─────────────────────────────────────────────────────────── */}
      {activeTab === "interview" && (
        <div className="space-y-6 animate-fade-in">
          {/* Controls Bar: Sub-Category Tabs & Flashcard Mode Toggle */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { id: "java", label: "Java Fundamentals & OOP" },
                { id: "spring", label: "Spring Boot & REST APIs" },
                { id: "sql", label: "SQL & PostgreSQL" },
                { id: "hr", label: "HR & Behavioral Questions" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setQuestionCategory(cat.id);
                    setCurrentCardIndex(0);
                    setIsFlipped(false);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-colors shrink-0 ${
                    questionCategory === cat.id
                      ? "bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan font-bold"
                      : "bg-dark-card text-gray-400 border border-dark-border hover:text-white"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Flashcard Mode Switch */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-dark-bg border border-dark-border self-start">
              <button
                type="button"
                onClick={() => setFlashcardMode(false)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                  !flashcardMode
                    ? "bg-dark-card text-white border border-dark-border font-bold shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                List View
              </button>
              <button
                type="button"
                onClick={() => {
                  setFlashcardMode(true);
                  setIsFlipped(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                  flashcardMode
                    ? "bg-neon-purple/20 text-neon-purple border border-neon-purple/40 font-bold"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Flashcard Quiz</span>
              </button>
            </div>
          </div>

          {/* FLASHCARD INTERACTIVE QUIZ MODE */}
          {flashcardMode ? (
            (() => {
              const questions = curatedQuestions[questionCategory] || [];
              const totalCards = questions.length;
              const currentQ = questions[currentCardIndex] || {};

              return (
                <div className="max-w-2xl mx-auto space-y-4">
                  {/* Progress Indicator */}
                  <div className="flex items-center justify-between text-xs font-mono text-gray-400">
                    <span>Card {currentCardIndex + 1} of {totalCards}</span>
                    <span className="text-neon-cyan">Click card or button to flip</span>
                  </div>

                  <div className="w-full bg-dark-border h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-neon-cyan to-neon-purple h-full transition-all duration-300"
                      style={{ width: `${((currentCardIndex + 1) / totalCards) * 100}%` }}
                    />
                  </div>

                  {/* Interactive Flip Card */}
                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="min-h-[300px] p-6 sm:p-8 rounded-2xl bg-dark-card border border-dark-border/90 shadow-2xl flex flex-col justify-between cursor-pointer transition-all duration-300 hover:border-neon-cyan/40 hover:shadow-glow-cyan"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono mb-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan">
                          {isFlipped ? "Answer & Interview Key" : "Question Prompt"}
                        </span>
                        <div className="flex items-center gap-1 text-gray-400">
                          <RotateCw className="w-3.5 h-3.5" />
                          <span>Flip</span>
                        </div>
                      </div>

                      {isFlipped ? (
                        <div className="space-y-4 animate-fade-in text-gray-200 text-sm leading-relaxed">
                          <p className="whitespace-pre-wrap">{currentQ.answer}</p>
                          {currentQ.keyTakeaway && (
                            <div className="p-3.5 rounded-xl bg-neon-cyan/5 border border-neon-cyan/20 text-neon-cyan text-xs font-mono">
                              💡 Interview Anchor: {currentQ.keyTakeaway}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="py-8 text-center animate-fade-in">
                          <span className="text-neon-purple font-mono text-xs uppercase tracking-widest block mb-3">
                            Technical Interview Prompt
                          </span>
                          <h3 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                            {currentQ.question}
                          </h3>
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] font-mono text-center text-gray-500 pt-4 border-t border-dark-border/60">
                      {isFlipped ? "Rate your recall confidence below" : "Formulate your answer in mind, then click to check"}
                    </p>
                  </div>

                  {/* Navigation & Evaluation */}
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      disabled={currentCardIndex === 0}
                      onClick={() => {
                        setCurrentCardIndex((prev) => Math.max(0, prev - 1));
                        setIsFlipped(false);
                      }}
                      className="px-4 py-2 rounded-xl border border-dark-border text-xs font-mono text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Previous</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="px-4 py-2 rounded-xl bg-dark-bg border border-neon-cyan/40 text-xs font-mono text-neon-cyan font-bold hover:bg-neon-cyan/10"
                    >
                      {isFlipped ? "Show Question" : "Reveal Answer"}
                    </button>

                    <button
                      type="button"
                      disabled={currentCardIndex === totalCards - 1}
                      onClick={() => {
                        setCurrentCardIndex((prev) => Math.min(totalCards - 1, prev + 1));
                        setIsFlipped(false);
                      }}
                      className="px-4 py-2 rounded-xl border border-dark-border text-xs font-mono text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                      <span>Next</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })()
          ) : (
            /* Question List View */
            <div className="space-y-3">
              {curatedQuestions[questionCategory]?.map((q, idx) => {
              const isOpen = expandedQuestions[idx];
              return (
                <Card
                  key={idx}
                  hoverable
                  className="p-5 cursor-pointer transition-all duration-200"
                  onClick={() => toggleQuestion(idx)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-mono text-neon-cyan font-bold mt-0.5">
                        Q{idx + 1}.
                      </span>
                      <h4 className="text-sm font-bold text-white leading-relaxed">
                        {q.question}
                      </h4>
                    </div>

                    <button
                      type="button"
                      className="text-gray-400 hover:text-neon-cyan p-1 shrink-0"
                    >
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {isOpen && (
                    <div className="mt-4 pt-4 border-t border-dark-border/60 text-xs text-gray-300 space-y-2 leading-relaxed animate-fade-in">
                      <p className="font-sans whitespace-pre-wrap">{q.answer}</p>
                      {q.keyTakeaway && (
                        <div className="p-3 rounded-xl bg-neon-cyan/5 border border-neon-cyan/20 text-neon-cyan font-mono text-[11px] mt-2">
                          💡 Key Interview Takeaway: {q.keyTakeaway}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* TAB 3: RESUME & POSITIONING                                */}
      {/* ─────────────────────────────────────────────────────────── */}
      {activeTab === "resume" && (
        <div className="space-y-6 animate-fade-in">
          <Card className="p-6 border-neon-cyan/30 shadow-glow-cyan bg-gradient-to-r from-dark-card via-dark-card to-dark-bg">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">
                  Karthik &bull; Online BCA (Manipal University Jaipur) Strategy
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed max-w-3xl">
                  In backend engineering hiring, your working code and project architecture speak louder than degree pedigree. Showcase production-grade Spring Boot APIs, transactional integrity, and Docker deployments.
                </p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Resume High-Impact Checklist</span>
              </h4>
              <ul className="space-y-2.5 text-xs text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-neon-cyan font-bold">&bull;</span>
                  <span>Highlight 2 flagship projects with live API links and clean GitHub READMEs.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neon-cyan font-bold">&bull;</span>
                  <span>Quantify accomplishments: "Designed order API handling 500 req/sec with PostgreSQL connection pooling."</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neon-cyan font-bold">&bull;</span>
                  <span>List verified skills: Java 21, Spring Boot 3, Spring Data JPA, PostgreSQL, Docker, Git.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neon-cyan font-bold">&bull;</span>
                  <span>Include LeetCode / DSA profile link demonstrating continuous problem solving.</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-neon-purple" />
                <span>Flagship Project Placement Blueprint</span>
              </h4>
              <div className="space-y-3 text-xs text-gray-300">
                <div className="p-3 rounded-xl bg-dark-bg/80 border border-dark-border space-y-1">
                  <p className="font-bold text-neon-cyan">Project 1: Personal Developer Command Centre</p>
                  <p className="text-gray-400 text-[11px]">
                    2FA-authenticated full-stack personal management platform built with Spring Security, Resend API, and PostgreSQL.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-dark-bg/80 border border-dark-border space-y-1">
                  <p className="font-bold text-neon-purple">Project 2: E-Commerce Order Management API</p>
                  <p className="text-gray-400 text-[11px]">
                    Production-grade RESTful service with database transactions, inventory locking, and Dockerized deployment.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Track Application Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-dark-card border border-dark-border shadow-2xl p-6 space-y-4 animate-slide-up max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-dark-border/80 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingAppId ? "Edit Job Application" : "Track New Job Application"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitApplication} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Company Name"
                  placeholder="e.g. Swiggy, Razorpay, Infosys..."
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                  autoFocus
                  required
                />
                <Input
                  label="Target Role"
                  placeholder="e.g. Backend Developer Intern, Software Engineer..."
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                    Application Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl text-xs bg-dark-bg/90 border border-dark-border text-gray-200 focus:outline-none focus:border-neon-cyan/50 font-mono"
                  >
                    <option value="APPLIED">Applied</option>
                    <option value="IN_REVIEW">In Review</option>
                    <option value="INTERVIEW">Interview Round</option>
                    <option value="OFFERED">Offer Received</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="ACCEPTED">Offer Accepted</option>
                  </select>
                </div>

                <Input
                  label="Eligibility / Criteria"
                  placeholder="e.g. BCA 2026 Batch, Java 21, 60%+"
                  value={formData.eligibility}
                  onChange={(e) =>
                    setFormData({ ...formData, eligibility: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Application Date"
                  type="date"
                  value={formData.applicationDate}
                  onChange={(e) =>
                    setFormData({ ...formData, applicationDate: e.target.value })
                  }
                />
                <Input
                  label="Follow-Up Date"
                  type="date"
                  value={formData.followUpDate}
                  onChange={(e) =>
                    setFormData({ ...formData, followUpDate: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                  Interview Round Notes & Recruiter Contacts
                </label>
                <textarea
                  rows={3}
                  placeholder="HR contact, referral name, round questions asked..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full p-3 rounded-xl text-xs bg-dark-bg/90 border border-dark-border text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan/50"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-dark-border/80">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  loading={formLoading}
                >
                  {editingAppId ? "Save Changes" : "Save Application"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Curated Interview Bank
const curatedQuestions = {
  java: [
    {
      question: "How does HashMap work internally in Java 8+?",
      answer: "HashMap uses an array of Node<K,V> buckets. Keys are hashed via hash() and assigned an index = (n - 1) & hash. Collisions are handled via LinkedList. In Java 8, when a bucket exceeds TREEIFY_THRESHOLD (8 items) and array capacity >= 64, the bucket converts to a Red-Black Tree, improving search from O(n) to O(log n).",
      keyTakeaway: "Mention hashCode(), equals(), collision handling, and Java 8 Treeification.",
    },
    {
      question: "What is the difference between String, StringBuilder, and StringBuffer?",
      answer: "String is immutable and stored in the String Constant Pool; every modification creates a new object. StringBuilder is mutable, fast, and non-synchronized (not thread-safe). StringBuffer is mutable and thread-safe because its methods are synchronized, incurring small synchronization overhead.",
      keyTakeaway: "Use StringBuilder in single-threaded loops; String for immutable constants.",
    },
    {
      question: "Explain the four core principles of OOP with real-world Java examples.",
      answer: "1. Encapsulation: bundling state and behavior within a class and restricting direct access via private fields and getters/setters.\n2. Inheritance: code reusability using 'extends'.\n3. Polymorphism: method overloading (compile-time) and method overriding (runtime).\n4. Abstraction: hiding implementation complexity using abstract classes and interfaces.",
      keyTakeaway: "Relate abstraction to Java interfaces (e.g. List interface vs ArrayList).",
    },
  ],
  spring: [
    {
      question: "What is Dependency Injection and Inversion of Control (IoC) in Spring Boot?",
      answer: "IoC is the architectural pattern where the framework, rather than the programmer, controls the lifecycle and binding of objects. Dependency Injection is the mechanism used to implement IoC: the Spring ApplicationContext injects bean instances via constructor injection, setter injection, or field injection.",
      keyTakeaway: "Always recommend constructor injection over @Autowired field injection for immutability and testability.",
    },
    {
      question: "What is the difference between @Controller and @RestController?",
      answer: "@Controller is traditionally used in Spring MVC to render web templates (HTML/JSP). @RestController is a convenience annotation combining @Controller and @ResponseBody, causing every handler method to serialize return objects directly into JSON/XML HTTP responses.",
      keyTakeaway: "@RestController automatically adds @ResponseBody to every endpoint.",
    },
    {
      question: "How does Spring Boot auto-configuration work behind the scenes?",
      answer: "@SpringBootApplication encapsulates @EnableAutoConfiguration. It inspects jar dependencies on the classpath via META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports and conditionally registers beans using @ConditionalOnClass and @ConditionalOnMissingBean.",
      keyTakeaway: "Explain how spring-boot-starter-data-jpa automatically wires DataSource and EntityManager.",
    },
  ],
  sql: [
    {
      question: "What is the difference between WHERE and HAVING in SQL?",
      answer: "WHERE filters rows before any group aggregations are performed. HAVING filters grouped rows after the GROUP BY clause and aggregate functions (SUM, COUNT, AVG) have been evaluated.",
      keyTakeaway: "WHERE cannot accept aggregate functions; HAVING operates on aggregated sets.",
    },
    {
      question: "Explain the four ACID properties in relational databases.",
      answer: "1. Atomicity: all operations in a transaction succeed or all fail.\n2. Consistency: database transitions only between valid states conforming to constraints.\n3. Isolation: concurrent transactions execute without interfering with one another.\n4. Durability: committed changes survive crashes.",
      keyTakeaway: "In Spring Boot, ACID transactions are managed declaratively using @Transactional.",
    },
    {
      question: "What is the difference between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN?",
      answer: "INNER JOIN returns records matching in both tables. LEFT JOIN returns all records from the left table, plus matched records from the right table (NULL if no match). FULL OUTER JOIN returns all records when there is a match in either left or right table.",
      keyTakeaway: "Be prepared to write query syntax using ON clauses.",
    },
  ],
  hr: [
    {
      question: "Tell me about yourself and why you chose Backend Engineering.",
      answer: "I am Karthik, pursuing Online BCA from Manipal University Jaipur. I fell in love with backend engineering because I enjoy system architecture, data flow, and database design. I've spent the past 10 months building production-grade Spring Boot APIs, mastering DSA in Java, and deploying secure full-stack applications with PostgreSQL.",
      keyTakeaway: "Keep answer under 90 seconds. Emphasize self-discipline, projects, and backend passion.",
    },
    {
      question: "How do you handle a bug or blocker you have never seen before?",
      answer: "I break down the problem methodically: 1) inspect the stack trace and reproduction steps, 2) isolate the failing layer (Controller, Service, or DB), 3) consult official documentation and logs, and 4) if necessary, write an isolated test case to reproduce and fix it cleanly.",
      keyTakeaway: "Shows structured debugging and problem-solving resilience.",
    },
  ],
};

const mockApplications = [
  {
    id: 1,
    company: "Razorpay",
    role: "Associate Software Engineer - Backend",
    eligibility: "Java, RESTful APIs, SQL proficiency",
    applicationDate: "2026-11-10",
    status: "APPLIED",
    followUpDate: "2026-11-25",
    notes: "Applied via career portal. Highlighted 2FA Command Centre and JPA optimization.",
  },
  {
    id: 2,
    company: "Swiggy",
    role: "Backend Intern",
    eligibility: "BCA / B.Tech 2026 Batch",
    applicationDate: "2026-11-14",
    status: "IN_REVIEW",
    followUpDate: "2026-11-28",
    notes: "Reached out to recruiter on LinkedIn with portfolio repo link.",
  },
];
