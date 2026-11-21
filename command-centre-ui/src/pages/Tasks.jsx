import React, { useState, useEffect } from "react";
import {
  CheckSquare,
  Plus,
  Search,
  Calendar,
  AlertCircle,
  Clock,
  Trash2,
  Edit3,
  CheckCircle2,
  Circle,
  Tag,
  X,
  Filter,
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Spinner from "../components/ui/Spinner";
import api from "../api/axios";
import { PRIORITIES } from "../utils/constants";
import { formatDate } from "../utils/formatters";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("all"); // "daily" | "weekly" | "all"
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    category: "Study",
    dueDate: new Date().toISOString().split("T")[0],
    status: "PENDING",
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [view, statusFilter, priorityFilter, searchQuery]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = {
        view,
        status: statusFilter,
        priority: priorityFilter,
        query: searchQuery,
      };
      const res = await api.get("/tasks", { params });
      if (res.data?.success && res.data?.data) {
        setTasks(res.data.data);
      } else {
        setTasks(mockTasks);
      }
    } catch (err) {
      setTasks(mockTasks);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingTaskId(null);
    setFormData({
      title: "",
      description: "",
      priority: "MEDIUM",
      category: "Study",
      dueDate: new Date().toISOString().split("T")[0],
      status: "PENDING",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setEditingTaskId(task.id);
    setFormData({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      category: task.category || "Study",
      dueDate: task.dueDate || new Date().toISOString().split("T")[0],
      status: task.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      setFormLoading(true);
      if (editingTaskId) {
        const res = await api.put(`/tasks/${editingTaskId}`, formData);
        if (res.data?.success && res.data?.data) {
          setTasks((prev) =>
            prev.map((t) => (t.id === editingTaskId ? res.data.data : t))
          );
        }
      } else {
        const res = await api.post("/tasks", formData);
        if (res.data?.success && res.data?.data) {
          setTasks((prev) => [res.data.data, ...prev]);
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      // Offline fallback
      if (editingTaskId) {
        setTasks((prev) =>
          prev.map((t) => (t.id === editingTaskId ? { ...t, ...formData } : t))
        );
      } else {
        const newTask = {
          id: Date.now(),
          ...formData,
          createdAt: new Date().toISOString(),
        };
        setTasks((prev) => [newTask, ...prev]);
      }
      setIsModalOpen(false);
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (task) => {
    const newStatus = task.status === "PENDING" ? "COMPLETED" : "PENDING";
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    );

    try {
      await api.patch(`/tasks/${task.id}/toggle`);
    } catch (err) {
      // Ignored in mock mode
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    try {
      await api.delete(`/tasks/${taskId}`);
    } catch (err) {
      // Ignored in mock mode
    }
  };

  const totalCount = tasks.length;
  const pendingCount = tasks.filter((t) => t.status === "PENDING").length;
  const completedCount = tasks.filter((t) => t.status === "COMPLETED").length;
  const highPriorityCount = tasks.filter(
    (t) => t.status === "PENDING" && t.priority === "HIGH"
  ).length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header & New Task Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 text-neon-cyan font-mono text-xs uppercase tracking-wider mb-1">
            <CheckSquare className="w-4 h-4" />
            <span>Execution Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            My Tasks
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Manage daily priorities, weekly sprints, and deadline commitments.
          </p>
        </div>

        <Button
          onClick={handleOpenCreateModal}
          size="md"
          className="gap-2 shrink-0 shadow-glow-cyan"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Task</span>
        </Button>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card hoverable className="p-4">
          <p className="text-xs font-mono text-gray-400 uppercase">Pending Tasks</p>
          <p className="text-2xl font-bold text-white mt-1 font-mono">{pendingCount}</p>
        </Card>
        <Card hoverable className="p-4">
          <p className="text-xs font-mono text-gray-400 uppercase">Completed</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1 font-mono">{completedCount}</p>
        </Card>
        <Card hoverable className="p-4">
          <p className="text-xs font-mono text-gray-400 uppercase">High Priority</p>
          <p className="text-2xl font-bold text-red-400 mt-1 font-mono">{highPriorityCount}</p>
        </Card>
        <Card hoverable className="p-4">
          <p className="text-xs font-mono text-gray-400 uppercase">Total Logged</p>
          <p className="text-2xl font-bold text-neon-cyan mt-1 font-mono">{totalCount}</p>
        </Card>
      </div>

      {/* Filter and View Controls Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-2xl bg-dark-card/60 border border-dark-border/80">
        {/* View Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-dark-bg/80 border border-dark-border self-start">
          {[
            { id: "all", label: "All Tasks" },
            { id: "daily", label: "Today's View" },
            { id: "weekly", label: "This Week" },
          ].map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setView(v.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                view === v.id
                  ? "bg-neon-cyan text-dark-bg font-bold shadow-glow-cyan"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Search & Select Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 text-cyan-400/70 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-[#0b1017] border border-[#1e293b] text-gray-100 placeholder-gray-500 hover:border-cyan-500/40 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/40 focus:shadow-[0_0_15px_rgba(0,240,255,0.2)]"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-[#0b1017] border border-[#1e293b] text-gray-200 hover:border-cyan-500/40 focus:outline-none focus:border-neon-cyan font-mono cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-[#0b1017] border border-[#1e293b] text-gray-200 hover:border-cyan-500/40 focus:outline-none focus:border-neon-cyan font-mono cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="md" color="cyan" />
        </div>
      ) : tasks.length > 0 ? (
        <div className="space-y-3">
          {tasks.map((task) => {
            const isCompleted = task.status === "COMPLETED";
            const priorityConfig = PRIORITIES[task.priority] || PRIORITIES.MEDIUM;

            return (
              <Card
                key={task.id}
                hoverable
                className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-all duration-300 ${
                  isCompleted ? "opacity-60 bg-dark-card/40" : ""
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Status Toggle Checkbox */}
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(task)}
                    className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all duration-200 shrink-0 ${
                      isCompleted
                        ? "bg-emerald-500 border-emerald-500 text-dark-bg"
                        : "border-gray-500 hover:border-neon-cyan"
                    }`}
                  >
                    {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4
                        className={`text-sm font-semibold truncate ${
                          isCompleted
                            ? "line-through text-gray-400"
                            : "text-white"
                        }`}
                      >
                        {task.title}
                      </h4>

                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${priorityConfig.bg} ${priorityConfig.color} ${priorityConfig.border}`}
                      >
                        {priorityConfig.label}
                      </span>

                      {task.category && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-dark-bg/80 border border-dark-border text-gray-400">
                          {task.category}
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-[11px] font-mono text-gray-500 pt-1">
                      {task.dueDate && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Due: {formatDate(task.dueDate)}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Edit & Delete Actions */}
                <div className="flex items-center gap-1.5 shrink-0 self-center">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(task)}
                    className="p-2 rounded-xl text-gray-400 hover:text-neon-cyan hover:bg-dark-hover transition-colors"
                    title="Edit Task"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete Task"
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
          <CheckSquare className="w-8 h-8 text-gray-600 mx-auto" />
          <h4 className="text-sm font-semibold text-gray-300">No tasks found</h4>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            You have no pending tasks in this view. Use the button above to create a new task and stay on track!
          </p>
        </Card>
      )}

      {/* Create / Edit Task Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-dark-card border border-dark-border shadow-2xl p-6 space-y-5 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-dark-border/80 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingTaskId ? "Edit Task" : "Create New Task"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitTask} className="space-y-4">
              <Input
                label="Task Title"
                placeholder="e.g. Solve 3 LeetCode questions, Review JDBC Joins..."
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                autoFocus
                required
              />

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                  Description / Subtasks
                </label>
                <textarea
                  rows={3}
                  placeholder="Details, acceptance criteria, or key steps..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full p-3 rounded-xl text-xs bg-dark-bg/90 border border-dark-border text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Priority */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl text-xs bg-dark-bg/90 border border-dark-border text-gray-200 focus:outline-none focus:border-neon-cyan/50 font-mono"
                  >
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl text-xs bg-dark-bg/90 border border-dark-border text-gray-200 focus:outline-none focus:border-neon-cyan/50 font-mono"
                  >
                    <option value="Study">Study</option>
                    <option value="DSA">DSA</option>
                    <option value="Projects">Projects</option>
                    <option value="Assignment">Assignment</option>
                    <option value="Career">Career</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              {/* Due Date */}
              <Input
                label="Due Date"
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
              />

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
                  {editingTaskId ? "Save Changes" : "Create Task"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Fallback seed tasks
const mockTasks = [
  {
    id: 1,
    title: "Complete OOP: Encapsulation & Polymorphism Notes",
    description: "Write clear examples demonstrating method overloading and overriding.",
    priority: "HIGH",
    category: "Study",
    status: "PENDING",
    dueDate: new Date().toISOString().split("T")[0],
  },
  {
    id: 2,
    title: "Solve 2 LeetCode String Matching Problems",
    description: "Longest common prefix, valid anagram with O(n) space.",
    priority: "HIGH",
    category: "DSA",
    status: "PENDING",
    dueDate: new Date().toISOString().split("T")[0],
  },
  {
    id: 3,
    title: "Set up local PostgreSQL database and test JDBC connection",
    description: "Verify PostgreSQL 16 connection with Maven dependency.",
    priority: "MEDIUM",
    category: "Projects",
    status: "COMPLETED",
    dueDate: new Date().toISOString().split("T")[0],
  },
];
