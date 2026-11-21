import React, { useState, useEffect } from "react";
import {
  FolderGit2,
  Plus,
  Search,
  ExternalLink,
  Github,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Layers,
  Edit3,
  Trash2,
  X,
  Sparkles,
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Spinner from "../components/ui/Spinner";
import api from "../api/axios";
import { PROJECT_STATUS } from "../utils/constants";
import { formatDate } from "../utils/formatters";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    techStack: "Java, Spring Boot, PostgreSQL",
    githubUrl: "",
    liveUrl: "",
    status: "IN_PROGRESS",
    startDate: new Date().toISOString().split("T")[0],
    completionDate: "",
    featuresCompleted: "",
    featuresPending: "",
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [statusFilter, searchQuery]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = {
        status: statusFilter,
        query: searchQuery,
      };
      const res = await api.get("/projects", { params });
      if (res.data?.success && res.data?.data) {
        setProjects(res.data.data);
      } else {
        setProjects(mockProjects);
      }
    } catch (err) {
      setProjects(mockProjects);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingProjectId(null);
    setFormData({
      name: "",
      description: "",
      techStack: "Java, Spring Boot, PostgreSQL",
      githubUrl: "",
      liveUrl: "",
      status: "PLANNED",
      startDate: new Date().toISOString().split("T")[0],
      completionDate: "",
      featuresCompleted: "",
      featuresPending: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (project) => {
    setEditingProjectId(project.id);
    setFormData({
      name: project.name,
      description: project.description || "",
      techStack: project.techStack || "",
      githubUrl: project.githubUrl || "",
      liveUrl: project.liveUrl || "",
      status: project.status || "PLANNED",
      startDate: project.startDate || "",
      completionDate: project.completionDate || "",
      featuresCompleted: project.featuresCompleted || "",
      featuresPending: project.featuresPending || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmitProject = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setFormLoading(true);
      if (editingProjectId) {
        const res = await api.put(`/projects/${editingProjectId}`, formData);
        if (res.data?.success && res.data?.data) {
          setProjects((prev) =>
            prev.map((p) => (p.id === editingProjectId ? res.data.data : p))
          );
        }
      } else {
        const res = await api.post("/projects", formData);
        if (res.data?.success && res.data?.data) {
          setProjects((prev) => [res.data.data, ...prev]);
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      // Offline fallback
      if (editingProjectId) {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === editingProjectId ? { ...p, ...formData } : p
          )
        );
      } else {
        const newProj = {
          id: Date.now(),
          ...formData,
          createdAt: new Date().toISOString(),
        };
        setProjects((prev) => [newProj, ...prev]);
      }
      setIsModalOpen(false);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    setProjects((prev) => prev.filter((p) => p.id !== id));
    try {
      await api.delete(`/projects/${id}`);
    } catch (err) {
      // Ignored in mock
    }
  };

  const parseLines = (text) => {
    if (!text) return [];
    return text
      .split("\n")
      .map((l) => l.trim().replace(/^[-*•]\s*/, ""))
      .filter((l) => l.length > 0);
  };

  const computeProgress = (completedText, pendingText, status) => {
    if (status === "COMPLETED") return 100;
    const completed = parseLines(completedText).length;
    const pending = parseLines(pendingText).length;
    const total = completed + pending;
    if (total === 0) {
      return status === "IN_PROGRESS" ? 25 : 0;
    }
    return Math.round((completed / total) * 100);
  };

  const totalProjects = projects.length;
  const inProgressProjects = projects.filter(
    (p) => p.status === "IN_PROGRESS"
  ).length;
  const completedProjects = projects.filter(
    (p) => p.status === "COMPLETED"
  ).length;
  const plannedProjects = projects.filter((p) => p.status === "PLANNED").length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 text-neon-cyan font-mono text-xs uppercase tracking-wider mb-1">
            <FolderGit2 className="w-4 h-4" />
            <span>Software Engineering Portfolio</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Projects
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Production-grade backend systems, APIs, Dockerized workflows, and microservices.
          </p>
        </div>

        <Button
          onClick={handleOpenCreateModal}
          size="md"
          className="gap-2 shrink-0 shadow-glow-cyan"
        >
          <Plus className="w-4 h-4" />
          <span>Add Project</span>
        </Button>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card hoverable className="p-4 border-neon-cyan/30">
          <p className="text-xs font-mono text-gray-400 uppercase">In Progress</p>
          <p className="text-2xl font-bold text-neon-cyan mt-1 font-mono">
            {inProgressProjects}
          </p>
        </Card>
        <Card hoverable className="p-4 border-emerald-500/30">
          <p className="text-xs font-mono text-gray-400 uppercase">Completed</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
            {completedProjects}
          </p>
        </Card>
        <Card hoverable className="p-4 border-gray-600/30">
          <p className="text-xs font-mono text-gray-400 uppercase">Planned</p>
          <p className="text-2xl font-bold text-gray-300 mt-1 font-mono">
            {plannedProjects}
          </p>
        </Card>
        <Card hoverable className="p-4 border-neon-purple/30">
          <p className="text-xs font-mono text-gray-400 uppercase">Total Projects</p>
          <p className="text-2xl font-bold text-neon-purple mt-1 font-mono">
            {totalProjects}
          </p>
        </Card>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-dark-card/60 border border-dark-border/80">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-dark-bg/80 border border-dark-border overflow-x-auto">
          {["ALL", "IN_PROGRESS", "PLANNED", "COMPLETED", "ON_HOLD"].map((st) => (
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
              {st === "ALL" ? "All Projects" : PROJECT_STATUS[st]?.label || st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-cyan-400/70 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search projects or stack..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-[#0b1017] border border-[#1e293b] text-gray-100 placeholder-gray-500 hover:border-cyan-500/40 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/40 focus:shadow-[0_0_15px_rgba(0,240,255,0.2)]"
          />
        </div>
      </div>

      {/* Projects Cards Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="md" color="cyan" />
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((proj) => {
            const completedList = parseLines(proj.featuresCompleted);
            const pendingList = parseLines(proj.featuresPending);
            const progress = computeProgress(
              proj.featuresCompleted,
              proj.featuresPending,
              proj.status
            );
            const statusConfig =
              PROJECT_STATUS[proj.status] || PROJECT_STATUS.PLANNED;

            const techTags = proj.techStack
              ? proj.techStack.split(",").map((t) => t.trim())
              : [];

            return (
              <Card
                key={proj.id}
                hoverable
                className="p-6 flex flex-col justify-between space-y-5"
              >
                {/* Header: Title, Status, Action icons */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold text-white tracking-tight">
                          {proj.name}
                        </h3>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border border-current/30 ${statusConfig.color} bg-dark-bg`}
                        >
                          {statusConfig.label}
                        </span>
                      </div>
                      {proj.startDate && (
                        <p className="text-[11px] font-mono text-gray-500 flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          <span>Started: {formatDate(proj.startDate)}</span>
                          {proj.completionDate && (
                            <span>&bull; Done: {formatDate(proj.completionDate)}</span>
                          )}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(proj)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-neon-cyan hover:bg-dark-hover transition-colors"
                        title="Edit Project"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProject(proj.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {proj.description && (
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {proj.description}
                    </p>
                  )}

                  {/* Tech Stack Pills */}
                  {techTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {techTags.map((tech, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-dark-bg/90 border border-dark-border text-[11px] font-mono text-neon-cyan"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Feature Progress Bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-[11px] font-mono text-gray-400">
                      <span>Feature Implementation</span>
                      <span className="text-neon-cyan font-bold">{progress}%</span>
                    </div>
                    <div className="w-full bg-dark-bg h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-neon-cyan to-neon-purple h-full rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Features List (Completed vs Pending) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                    {/* Completed */}
                    <div className="space-y-1.5 p-3 rounded-xl bg-dark-bg/60 border border-dark-border/60">
                      <p className="text-[10px] font-mono uppercase text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Completed Features ({completedList.length})</span>
                      </p>
                      {completedList.length > 0 ? (
                        <ul className="space-y-1 text-gray-300">
                          {completedList.slice(0, 4).map((feat, i) => (
                            <li key={i} className="flex items-start gap-1.5 leading-snug">
                              <span className="text-emerald-400">&bull;</span>
                              <span className="truncate">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[11px] text-gray-500">None yet</p>
                      )}
                    </div>

                    {/* Pending */}
                    <div className="space-y-1.5 p-3 rounded-xl bg-dark-bg/60 border border-dark-border/60">
                      <p className="text-[10px] font-mono uppercase text-amber-400 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Pending Features ({pendingList.length})</span>
                      </p>
                      {pendingList.length > 0 ? (
                        <ul className="space-y-1 text-gray-400">
                          {pendingList.slice(0, 4).map((feat, i) => (
                            <li key={i} className="flex items-start gap-1.5 leading-snug">
                              <span className="text-amber-400">&bull;</span>
                              <span className="truncate">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[11px] text-gray-500">All features ready</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer External Links */}
                <div className="flex items-center gap-3 pt-4 border-t border-dark-border/60">
                  {proj.githubUrl && (
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dark-bg border border-dark-border text-xs text-gray-300 hover:text-white hover:border-gray-500 transition-colors"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>GitHub Repo</span>
                    </a>
                  )}

                  {proj.liveUrl && (
                    <a
                      href={proj.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 text-xs text-neon-cyan hover:bg-neon-cyan hover:text-dark-bg transition-all duration-200"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Live Demo</span>
                    </a>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center border-dashed border-dark-border space-y-3">
          <FolderGit2 className="w-8 h-8 text-gray-600 mx-auto" />
          <h4 className="text-sm font-semibold text-gray-300">No projects found</h4>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Log your backend projects to track API development, architecture milestones, and deployment readiness!
          </p>
        </Card>
      )}

      {/* Create / Edit Project Modal */}
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
                {editingProjectId ? "Edit Project" : "Add New Project"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitProject} className="space-y-4">
              <Input
                label="Project Name"
                placeholder="e.g. E-Commerce Order Management API, Personal Developer Command Centre..."
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                autoFocus
                required
              />

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Architectural purpose, backend problem being solved, core goals..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full p-3 rounded-xl text-xs bg-dark-bg/90 border border-dark-border text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Tech Stack (comma separated)"
                  placeholder="Java, Spring Boot, PostgreSQL, Docker"
                  value={formData.techStack}
                  onChange={(e) =>
                    setFormData({ ...formData, techStack: e.target.value })
                  }
                />

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                    Project Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl text-xs bg-dark-bg/90 border border-dark-border text-gray-200 focus:outline-none focus:border-neon-cyan/50 font-mono"
                  >
                    <option value="PLANNED">Planned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="ON_HOLD">On Hold</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="GitHub Repo URL"
                  type="url"
                  placeholder="https://github.com/..."
                  value={formData.githubUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, githubUrl: e.target.value })
                  }
                />
                <Input
                  label="Live Deployment URL"
                  type="url"
                  placeholder="https://..."
                  value={formData.liveUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, liveUrl: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Start Date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
                <Input
                  label="Completion Date"
                  type="date"
                  value={formData.completionDate}
                  onChange={(e) =>
                    setFormData({ ...formData, completionDate: e.target.value })
                  }
                />
              </div>

              {/* Features Completed */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-emerald-400 mb-1.5">
                  Features Completed (one per line)
                </label>
                <textarea
                  rows={3}
                  placeholder="JWT Authentication&#10;Product Catalog API&#10;PostgreSQL Database Migration"
                  value={formData.featuresCompleted}
                  onChange={(e) =>
                    setFormData({ ...formData, featuresCompleted: e.target.value })
                  }
                  className="w-full p-3 rounded-xl text-xs bg-dark-bg/90 border border-dark-border text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan/50 font-mono"
                />
              </div>

              {/* Features Pending */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-amber-400 mb-1.5">
                  Features Pending (one per line)
                </label>
                <textarea
                  rows={3}
                  placeholder="Payment Webhooks&#10;Docker Containerization&#10;CI/CD Pipeline"
                  value={formData.featuresPending}
                  onChange={(e) =>
                    setFormData({ ...formData, featuresPending: e.target.value })
                  }
                  className="w-full p-3 rounded-xl text-xs bg-dark-bg/90 border border-dark-border text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan/50 font-mono"
                />
              </div>

              {/* Actions */}
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
                  {editingProjectId ? "Save Changes" : "Create Project"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Fallback seed projects
const mockProjects = [
  {
    id: 1,
    name: "Personal Developer Command Centre",
    description: "Private full-stack cockpit to manage an 8-12 month backend development roadmap with 2FA email authentication.",
    techStack: "Java, Spring Boot, PostgreSQL, React, Vite, Tailwind CSS, Resend",
    githubUrl: "https://github.com/Karthik-2102/command-centre",
    liveUrl: "http://localhost:5173",
    status: "IN_PROGRESS",
    startDate: "2026-11-01",
    completionDate: null,
    featuresCompleted: "Spring Security 2FA\nResend Email OTP Service\nPostgreSQL Schema with 13 Entities\nFuturistic Neon UI Shell",
    featuresPending: "Docker Containerization\nAutomated Test Suite\nCloud Deployment",
  },
  {
    id: 2,
    name: "E-commerce Order Management REST API",
    description: "High-throughput microservice backend handling customer carts, inventory reservation, and payment processing.",
    techStack: "Java 21, Spring Boot 3, Spring Data JPA, PostgreSQL, Docker",
    githubUrl: "https://github.com/Karthik-2102/order-management-api",
    liveUrl: "",
    status: "PLANNED",
    startDate: "2026-12-01",
    completionDate: null,
    featuresCompleted: "",
    featuresPending: "Order Placement Workflow\nInventory Concurrency Locking\nKafka Event Streaming\nDocker Compose Setup",
  },
];
