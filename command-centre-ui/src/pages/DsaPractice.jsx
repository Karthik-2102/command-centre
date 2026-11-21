import React, { useState, useEffect } from "react";
import {
  Code2,
  Plus,
  Search,
  ExternalLink,
  CheckCircle2,
  Circle,
  Clock,
  Cpu,
  Trash2,
  Edit3,
  X,
  ChevronDown,
  ChevronUp,
  Tag,
  BookOpen,
  RotateCcw,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Spinner from "../components/ui/Spinner";
import api from "../api/axios";
import { DSA_DIFFICULTY } from "../utils/constants";
import { formatDate } from "../utils/formatters";

export default function DsaPractice() {
  const [problems, setProblems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");
  const [topicFilter, setTopicFilter] = useState("ALL");
  const [platformFilter, setPlatformFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Expanded notes state (by problem ID)
  const [expandedNotes, setExpandedNotes] = useState({});

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProblemId, setEditingProblemId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    platform: "LeetCode",
    topic: "Arrays",
    difficulty: "EASY",
    problemUrl: "",
    dateSolved: new Date().toISOString().split("T")[0],
    solutionNotes: "",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    status: "SOLVED",
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchProblemsAndStats();
  }, [difficultyFilter, topicFilter, platformFilter, statusFilter, searchQuery]);

  const fetchProblemsAndStats = async () => {
    try {
      setLoading(true);
      const params = {
        difficulty: difficultyFilter,
        topic: topicFilter,
        platform: platformFilter,
        status: statusFilter,
        query: searchQuery,
      };

      const [probRes, statRes] = await Promise.allSettled([
        api.get("/dsa", { params }),
        api.get("/dsa/stats"),
      ]);

      if (probRes.status === "fulfilled" && probRes.value.data?.success) {
        setProblems(probRes.value.data.data);
      } else {
        setProblems(mockProblems);
      }

      if (statRes.status === "fulfilled" && statRes.value.data?.success) {
        setStats(statRes.value.data.data);
      } else {
        setStats(mockStats);
      }
    } catch (err) {
      setProblems(mockProblems);
      setStats(mockStats);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingProblemId(null);
    setFormData({
      title: "",
      platform: "LeetCode",
      topic: "Arrays",
      difficulty: "EASY",
      problemUrl: "",
      dateSolved: new Date().toISOString().split("T")[0],
      solutionNotes: "",
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      status: "SOLVED",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (problem) => {
    setEditingProblemId(problem.id);
    setFormData({
      title: problem.title,
      platform: problem.platform || "LeetCode",
      topic: problem.topic || "Arrays",
      difficulty: problem.difficulty || "MEDIUM",
      problemUrl: problem.problemUrl || "",
      dateSolved: problem.dateSolved || new Date().toISOString().split("T")[0],
      solutionNotes: problem.solutionNotes || "",
      timeComplexity: problem.timeComplexity || "O(n)",
      spaceComplexity: problem.spaceComplexity || "O(1)",
      status: problem.status || "SOLVED",
    });
    setIsModalOpen(true);
  };

  const handleSubmitProblem = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      setFormLoading(true);
      if (editingProblemId) {
        const res = await api.put(`/dsa/${editingProblemId}`, formData);
        if (res.data?.success && res.data?.data) {
          setProblems((prev) =>
            prev.map((p) => (p.id === editingProblemId ? res.data.data : p))
          );
        }
      } else {
        const res = await api.post("/dsa", formData);
        if (res.data?.success && res.data?.data) {
          setProblems((prev) => [res.data.data, ...prev]);
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      // Offline fallback
      if (editingProblemId) {
        setProblems((prev) =>
          prev.map((p) => (p.id === editingProblemId ? { ...p, ...formData } : p))
        );
      } else {
        const newProb = {
          id: Date.now(),
          ...formData,
          createdAt: new Date().toISOString(),
        };
        setProblems((prev) => [newProb, ...prev]);
      }
      setIsModalOpen(false);
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (problem) => {
    const newStatus = problem.status === "SOLVED" ? "UNSOLVED" : "SOLVED";
    setProblems((prev) =>
      prev.map((p) => (p.id === problem.id ? { ...p, status: newStatus } : p))
    );

    try {
      await api.patch(`/dsa/${problem.id}/toggle`);
    } catch (err) {
      // Ignored in mock
    }
  };

  const handleDeleteProblem = async (id) => {
    if (!window.confirm("Delete this DSA problem record?")) return;
    setProblems((prev) => prev.filter((p) => p.id !== id));
    try {
      await api.delete(`/dsa/${id}`);
    } catch (err) {
      // Ignored in mock
    }
  };

  const toggleNotes = (id) => {
    setExpandedNotes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const calculateSrsInfo = (dateSolved) => {
    if (!dateSolved) return { isDue: false, label: "Unsolved", days: 0 };
    const solved = new Date(dateSolved);
    const now = new Date();
    const diffDays = Math.max(0, Math.floor((now - solved) / (1000 * 60 * 60 * 24)));

    if (diffDays >= 45) return { isDue: true, label: "SRS #4 Due (45d+)", level: 4, diffDays };
    if (diffDays >= 21) return { isDue: true, label: "SRS #3 Due (21d+)", level: 3, diffDays };
    if (diffDays >= 7) return { isDue: true, label: "SRS #2 Due (7d+)", level: 2, diffDays };
    if (diffDays >= 3) return { isDue: true, label: "SRS #1 Due (3d+)", level: 1, diffDays };
    return { isDue: false, label: `Fresh (${diffDays}d ago)`, level: 0, diffDays };
  };

  const handleMarkReviewed = async (problem) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const updated = {
        ...problem,
        dateSolved: today,
        status: "SOLVED",
      };
      setProblems((prev) =>
        prev.map((p) => (p.id === problem.id ? { ...p, dateSolved: today, status: "SOLVED" } : p))
      );
      await api.put(`/dsa/${problem.id}`, updated);
    } catch (err) {
      console.error("Failed to mark problem reviewed:", err);
    }
  };

  const srsDueCount = problems.filter((p) => p.status === "SOLVED" && calculateSrsInfo(p.dateSolved).isDue).length;

  const filteredProblems = problems.filter((p) => {
    if (difficultyFilter !== "ALL" && p.difficulty !== difficultyFilter) return false;
    if (topicFilter !== "ALL" && p.topic !== topicFilter) return false;
    if (platformFilter !== "ALL" && p.platform !== platformFilter) return false;

    if (statusFilter === "SRS_DUE") {
      const srs = calculateSrsInfo(p.dateSolved);
      if (!srs.isDue || p.status !== "SOLVED") return false;
    } else if (statusFilter !== "ALL" && p.status !== statusFilter) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title?.toLowerCase().includes(q);
      const matchTopic = p.topic?.toLowerCase().includes(q);
      const matchNotes = p.solutionNotes?.toLowerCase().includes(q);
      if (!matchTitle && !matchTopic && !matchNotes) return false;
    }
    return true;
  });

  const currentStats = stats || mockStats;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 text-neon-cyan font-mono text-xs uppercase tracking-wider mb-1">
            <Code2 className="w-4 h-4" />
            <span>Algorithm Tracking</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            DSA Practice
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Systematic problem-solving tracking across LeetCode, HackerRank, and GeeksforGeeks.
          </p>
        </div>

        <Button
          onClick={handleOpenCreateModal}
          size="md"
          className="gap-2 shrink-0 shadow-glow-cyan"
        >
          <Plus className="w-4 h-4" />
          <span>Log DSA Problem</span>
        </Button>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card hoverable className="p-4 border-emerald-500/30">
          <p className="text-xs font-mono text-gray-400 uppercase">Easy Solved</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
            {currentStats.easySolved || 0}
          </p>
        </Card>
        <Card hoverable className="p-4 border-yellow-500/30">
          <p className="text-xs font-mono text-gray-400 uppercase">Medium Solved</p>
          <p className="text-2xl font-bold text-yellow-400 mt-1 font-mono">
            {currentStats.mediumSolved || 0}
          </p>
        </Card>
        <Card hoverable className="p-4 border-red-500/30">
          <p className="text-xs font-mono text-gray-400 uppercase">Hard Solved</p>
          <p className="text-2xl font-bold text-red-400 mt-1 font-mono">
            {currentStats.hardSolved || 0}
          </p>
        </Card>
        <Card hoverable className="p-4 border-neon-cyan/30">
          <p className="text-xs font-mono text-gray-400 uppercase">Total Solved</p>
          <p className="text-2xl font-bold text-neon-cyan mt-1 font-mono">
            {currentStats.solved || 0}
          </p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-2xl bg-dark-card/60 border border-dark-border/80">
        {/* Difficulty Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-dark-bg/80 border border-dark-border self-start">
          {["ALL", "EASY", "MEDIUM", "HARD"].map((diff) => (
            <button
              key={diff}
              type="button"
              onClick={() => setDifficultyFilter(diff)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                difficultyFilter === diff
                  ? "bg-neon-cyan text-dark-bg font-bold shadow-glow-cyan"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {diff === "ALL" ? "All Levels" : diff}
            </button>
          ))}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 text-cyan-400/70 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search problems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-[#0b1017] border border-[#1e293b] text-gray-100 placeholder-gray-500 hover:border-cyan-500/40 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/40 focus:shadow-[0_0_15px_rgba(0,240,255,0.2)]"
            />
          </div>

          {/* Platform Filter */}
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-[#0b1017] border border-[#1e293b] text-gray-200 hover:border-cyan-500/40 focus:outline-none focus:border-neon-cyan font-mono cursor-pointer"
          >
            <option value="ALL">All Platforms</option>
            <option value="LeetCode">LeetCode</option>
            <option value="HackerRank">HackerRank</option>
            <option value="GeeksforGeeks">GeeksforGeeks</option>
            <option value="CodeStudio">CodeStudio</option>
          </select>

          {/* Topic Filter */}
          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-[#0b1017] border border-[#1e293b] text-gray-200 hover:border-cyan-500/40 focus:outline-none focus:border-neon-cyan font-mono cursor-pointer"
          >
            <option value="ALL">All Topics</option>
            <option value="Arrays">Arrays</option>
            <option value="Strings">Strings</option>
            <option value="Two Pointers">Two Pointers</option>
            <option value="Hashing">Hashing</option>
            <option value="Recursion">Recursion</option>
            <option value="Binary Search">Binary Search</option>
            <option value="Stack & Queue">Stack & Queue</option>
            <option value="Linked List">Linked List</option>
            <option value="Trees">Trees</option>
            <option value="Dynamic Programming">Dynamic Programming</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-[#0b1017] border border-[#1e293b] text-gray-200 hover:border-cyan-500/40 focus:outline-none focus:border-neon-cyan font-mono cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="SOLVED">Solved</option>
            <option value="UNSOLVED">Unsolved</option>
            <option value="SRS_DUE">Revision Due (SRS)</option>
          </select>
        </div>
      </div>

      {/* SRS Revision Due Alert Banner */}
      {srsDueCount > 0 && statusFilter !== "SRS_DUE" && (
        <div className="p-4 rounded-2xl bg-neon-purple/10 border border-neon-purple/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in shadow-[0_0_20px_rgba(168,85,247,0.12)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neon-purple/20 border border-neon-purple/40 flex items-center justify-center text-neon-purple shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <span>Spaced Repetition: {srsDueCount} problem{srsDueCount > 1 ? "s" : ""} due for revision!</span>
              </h4>
              <p className="text-xs text-gray-400">
                Reinforce algorithmic retention (+3d, +7d, +21d intervals) before pattern fades.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStatusFilter("SRS_DUE")}
            className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-neon-purple text-white hover:bg-purple-600 transition-colors shrink-0 self-start sm:self-center"
          >
            View Review Queue ({srsDueCount})
          </button>
        </div>
      )}

      {/* Problems List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="md" color="cyan" />
        </div>
      ) : filteredProblems.length > 0 ? (
        <div className="space-y-3.5">
          {filteredProblems.map((p) => {
            const isSolved = p.status === "SOLVED";
            const diffConfig = DSA_DIFFICULTY[p.difficulty] || DSA_DIFFICULTY.MEDIUM;
            const hasNotes = p.solutionNotes && p.solutionNotes.trim().length > 0;
            const isExpanded = expandedNotes[p.id];
            const srs = calculateSrsInfo(p.dateSolved);

            return (
              <Card
                key={p.id}
                hoverable
                className="p-4 sm:p-5 transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Status Toggle Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(p)}
                      className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all duration-200 shrink-0 ${
                        isSolved
                          ? "bg-emerald-500 border-emerald-500 text-dark-bg"
                          : "border-gray-500 hover:border-neon-cyan"
                      }`}
                      title={isSolved ? "Mark as Unsolved" : "Mark as Solved"}
                    >
                      {isSolved && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-white truncate max-w-md">
                          {p.title}
                        </h4>

                        {p.problemUrl && (
                          <a
                            href={p.problemUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-neon-cyan transition-colors"
                            title="Open Problem in External Platform"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${diffConfig.bg} ${diffConfig.color} border-current/30`}
                        >
                          {diffConfig.label}
                        </span>

                        {p.platform && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-dark-bg border border-dark-border text-gray-300">
                            {p.platform}
                          </span>
                        )}

                        {p.topic && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neon-purple/10 border border-neon-purple/30 text-neon-purple">
                            {p.topic}
                          </span>
                        )}

                        {isSolved && (
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                              srs.isDue
                                ? "bg-purple-500/20 border-purple-500/50 text-purple-300 font-bold"
                                : "bg-dark-bg/80 border-dark-border text-gray-400"
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            <span>{srs.label}</span>
                          </span>
                        )}
                      </div>

                      {/* Complexity & Date */}
                      <div className="flex items-center gap-3 text-[11px] font-mono text-gray-400 flex-wrap">
                        {p.timeComplexity && (
                          <span className="flex items-center gap-1 text-neon-cyan/80">
                            <Clock className="w-3 h-3" />
                            <span>Time: {p.timeComplexity}</span>
                          </span>
                        )}
                        {p.spaceComplexity && (
                          <span className="flex items-center gap-1 text-neon-purple/80">
                            <Cpu className="w-3 h-3" />
                            <span>Space: {p.spaceComplexity}</span>
                          </span>
                        )}
                        {p.dateSolved && (
                          <span className="text-gray-500">
                            Solved: {formatDate(p.dateSolved)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {isSolved && srs.isDue && (
                      <button
                        type="button"
                        onClick={() => handleMarkReviewed(p)}
                        title="Mark Reviewed Today (Advances to Next Spaced Repetition Interval)"
                        className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-neon-purple bg-neon-purple/15 border border-neon-purple/40 hover:bg-neon-purple/25 flex items-center gap-1.5 transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Reviewed</span>
                      </button>
                    )}

                    {hasNotes && (
                      <button
                        type="button"
                        onClick={() => toggleNotes(p.id)}
                        className="px-2.5 py-1 rounded-lg text-xs font-mono text-gray-400 hover:text-white bg-dark-bg/80 border border-dark-border flex items-center gap-1 transition-colors"
                      >
                        <span>Approach</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(p)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-neon-cyan hover:bg-dark-hover transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProblem(p.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Collapsible Solution Notes Box */}
                {hasNotes && isExpanded && (
                  <div className="mt-3 pt-3 border-t border-dark-border/60 p-3 rounded-xl bg-dark-bg/80 text-xs text-gray-300 font-mono whitespace-pre-wrap leading-relaxed animate-fade-in">
                    {p.solutionNotes}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center border-dashed border-dark-border space-y-3">
          <Code2 className="w-8 h-8 text-gray-600 mx-auto" />
          <h4 className="text-sm font-semibold text-gray-300">No problems logged</h4>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Log your practice questions to build complexity intuition and track your problem-solving metrics!
          </p>
        </Card>
      )}

      {/* Log Problem Modal */}
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
                {editingProblemId ? "Edit Problem Record" : "Log DSA Problem"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitProblem} className="space-y-4">
              <Input
                label="Problem Title"
                placeholder="e.g. Two Sum, Valid Palindrome, Reverse Linked List..."
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                autoFocus
                required
              />

              <div className="grid grid-cols-2 gap-3">
                {/* Platform */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                    Platform
                  </label>
                  <select
                    value={formData.platform}
                    onChange={(e) =>
                      setFormData({ ...formData, platform: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl text-xs bg-dark-bg/90 border border-dark-border text-gray-200 focus:outline-none focus:border-neon-cyan/50 font-mono"
                  >
                    <option value="LeetCode">LeetCode</option>
                    <option value="HackerRank">HackerRank</option>
                    <option value="GeeksforGeeks">GeeksforGeeks</option>
                    <option value="CodeStudio">CodeStudio</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                    Difficulty
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData({ ...formData, difficulty: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl text-xs bg-dark-bg/90 border border-dark-border text-gray-200 focus:outline-none focus:border-neon-cyan/50 font-mono"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Topic */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                    Topic
                  </label>
                  <select
                    value={formData.topic}
                    onChange={(e) =>
                      setFormData({ ...formData, topic: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl text-xs bg-dark-bg/90 border border-dark-border text-gray-200 focus:outline-none focus:border-neon-cyan/50 font-mono"
                  >
                    <option value="Arrays">Arrays</option>
                    <option value="Strings">Strings</option>
                    <option value="Two Pointers">Two Pointers</option>
                    <option value="Sliding Window">Sliding Window</option>
                    <option value="Hashing">Hashing</option>
                    <option value="Binary Search">Binary Search</option>
                    <option value="Recursion">Recursion</option>
                    <option value="Stack & Queue">Stack & Queue</option>
                    <option value="Linked List">Linked List</option>
                    <option value="Trees">Trees</option>
                    <option value="Dynamic Programming">Dynamic Programming</option>
                  </select>
                </div>

                {/* Problem URL */}
                <Input
                  label="Problem URL"
                  type="url"
                  placeholder="https://leetcode.com/problems/..."
                  value={formData.problemUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, problemUrl: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Time Complexity"
                  placeholder="e.g. O(n)"
                  value={formData.timeComplexity}
                  onChange={(e) =>
                    setFormData({ ...formData, timeComplexity: e.target.value })
                  }
                />
                <Input
                  label="Space Complexity"
                  placeholder="e.g. O(1)"
                  value={formData.spaceComplexity}
                  onChange={(e) =>
                    setFormData({ ...formData, spaceComplexity: e.target.value })
                  }
                />
                <Input
                  label="Date Solved"
                  type="date"
                  value={formData.dateSolved}
                  onChange={(e) =>
                    setFormData({ ...formData, dateSolved: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                  Approach & Solution Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain algorithm intuition, corner cases, data structure choices..."
                  value={formData.solutionNotes}
                  onChange={(e) =>
                    setFormData({ ...formData, solutionNotes: e.target.value })
                  }
                  className="w-full p-3 rounded-xl text-xs bg-dark-bg/90 border border-dark-border text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan/50"
                />
              </div>

              {/* Modal Actions */}
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
                  {editingProblemId ? "Save Changes" : "Log Problem"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Fallback seed DSA questions
const mockProblems = [
  {
    id: 1,
    title: "Two Sum",
    platform: "LeetCode",
    topic: "Arrays",
    difficulty: "EASY",
    problemUrl: "https://leetcode.com/problems/two-sum/",
    dateSolved: "2026-11-10",
    solutionNotes: "Utilize a HashMap to store complements (target - num). Single pass gives O(n) time.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    status: "SOLVED",
  },
  {
    id: 2,
    title: "Valid Anagram",
    platform: "LeetCode",
    topic: "Strings",
    difficulty: "EASY",
    problemUrl: "https://leetcode.com/problems/valid-anagram/",
    dateSolved: "2026-11-12",
    solutionNotes: "Count frequency using an integer array of size 26 for ASCII lowercase letters.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    status: "SOLVED",
  },
  {
    id: 3,
    title: "3Sum",
    platform: "LeetCode",
    topic: "Two Pointers",
    difficulty: "MEDIUM",
    problemUrl: "https://leetcode.com/problems/3sum/",
    dateSolved: "2026-11-15",
    solutionNotes: "Sort array first. Fix one pointer i, then use two pointers left and right. Skip duplicate values.",
    timeComplexity: "O(n^2)",
    spaceComplexity: "O(1)",
    status: "SOLVED",
  },
];

const mockStats = {
  total: 24,
  solved: 24,
  unsolved: 0,
  easySolved: 14,
  mediumSolved: 8,
  hardSolved: 2,
};
