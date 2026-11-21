import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Calendar,
  CheckCircle2,
  Bug,
  HelpCircle,
  Github,
  Code2,
  Target,
  Sparkles,
  Edit3,
  Trash2,
  X,
  Lightbulb,
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Spinner from "../components/ui/Spinner";
import api from "../api/axios";
import { formatDate } from "../utils/formatters";

export default function WeeklyReview() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [aggregating, setAggregating] = useState(false);
  const [aggregateStats, setAggregateStats] = useState(null);
  const [formData, setFormData] = useState({
    weekStartDate: getMonday(new Date()),
    conceptsLearned: "",
    programsCompleted: "",
    bugsSolved: "",
    unclearTopics: "",
    githubCommits: "",
    dsaProblemsSolved: 5,
    nextWeekGoal: "",
  });
  const [formLoading, setFormLoading] = useState(false);

  const handleAutoAggregate = async () => {
    try {
      setAggregating(true);
      const res = await api.get("/reviews/auto-aggregate", {
        params: { weekStart: formData.weekStartDate },
      });
      if (res.data?.success && res.data?.data) {
        const d = res.data.data;
        setAggregateStats(d);
        setFormData((prev) => ({
          ...prev,
          conceptsLearned: d.conceptsLearned || prev.conceptsLearned,
          programsCompleted: d.programsCompleted || prev.programsCompleted,
          dsaProblemsSolved: d.dsaProblemsSolved ?? prev.dsaProblemsSolved,
          bugsSolved: d.bugsSolved || prev.bugsSolved,
          nextWeekGoal: d.nextWeekGoal || prev.nextWeekGoal,
        }));
      }
    } catch (err) {
      console.error("Auto aggregation failed:", err);
    } finally {
      setAggregating(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  function getMonday(d) {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff)).toISOString().split("T")[0];
  }

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get("/reviews");
      if (res.data?.success && res.data?.data) {
        setReviews(res.data.data);
      } else {
        setReviews(mockReviews);
      }
    } catch (err) {
      setReviews(mockReviews);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingReviewId(null);
    setFormData({
      weekStartDate: getMonday(new Date()),
      conceptsLearned: "",
      programsCompleted: "",
      bugsSolved: "",
      unclearTopics: "",
      githubCommits: "",
      dsaProblemsSolved: 5,
      nextWeekGoal: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (review) => {
    setEditingReviewId(review.id);
    setFormData({
      weekStartDate: review.weekStartDate || getMonday(new Date()),
      conceptsLearned: review.conceptsLearned || "",
      programsCompleted: review.programsCompleted || "",
      bugsSolved: review.bugsSolved || "",
      unclearTopics: review.unclearTopics || "",
      githubCommits: review.githubCommits || "",
      dsaProblemsSolved: review.dsaProblemsSolved || 0,
      nextWeekGoal: review.nextWeekGoal || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      if (editingReviewId) {
        const res = await api.put(`/reviews/${editingReviewId}`, formData);
        if (res.data?.success && res.data?.data) {
          setReviews((prev) =>
            prev.map((r) => (r.id === editingReviewId ? res.data.data : r))
          );
        }
      } else {
        const res = await api.post("/reviews", formData);
        if (res.data?.success && res.data?.data) {
          setReviews((prev) => [res.data.data, ...prev]);
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      // Offline fallback
      if (editingReviewId) {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === editingReviewId ? { ...r, ...formData } : r
          )
        );
      } else {
        const newRev = {
          id: Date.now(),
          ...formData,
          createdAt: new Date().toISOString(),
        };
        setReviews((prev) => [newRev, ...prev]);
      }
      setIsModalOpen(false);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm("Delete this weekly review record?")) return;
    setReviews((prev) => prev.filter((r) => r.id !== id));
    try {
      await api.delete(`/reviews/${id}`);
    } catch (err) {
      // Ignored in mock
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 text-neon-cyan font-mono text-xs uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>Retrospective & Growth Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Weekly Reviews
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            7-question reflection to audit weekly learning, unblock hurdles, and calibrate next week's focus.
          </p>
        </div>

        <Button
          onClick={handleOpenCreateModal}
          size="md"
          className="gap-2 shrink-0 shadow-glow-cyan"
        >
          <Plus className="w-4 h-4" />
          <span>Write Weekly Review</span>
        </Button>
      </div>

      {/* Review List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="md" color="cyan" />
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((rev) => (
            <Card
              key={rev.id}
              hoverable
              className="p-6 sm:p-7 space-y-6 border-neon-cyan/20"
            >
              {/* Review Card Header */}
              <div className="flex items-center justify-between border-b border-dark-border/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">
                      Weekly Retrospective
                    </span>
                    <h3 className="text-base font-bold text-white font-mono">
                      Week of {formatDate(rev.weekStartDate)}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neon-purple/10 border border-neon-purple/30 text-neon-purple text-xs font-mono">
                    <Code2 className="w-3.5 h-3.5" />
                    <span>{rev.dsaProblemsSolved || 0} DSA Solved</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(rev)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-neon-cyan hover:bg-dark-hover transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteReview(rev.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 7 Guided Reflection Questions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* 1. Concepts Learned */}
                <div className="p-4 rounded-xl bg-dark-bg/60 border border-dark-border/80 space-y-1.5">
                  <p className="font-mono text-neon-cyan font-semibold flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>1. What concepts did I learn?</span>
                  </p>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {rev.conceptsLearned || "None recorded"}
                  </p>
                </div>

                {/* 2. Programs / Features Completed */}
                <div className="p-4 rounded-xl bg-dark-bg/60 border border-dark-border/80 space-y-1.5">
                  <p className="font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>2. What programs or features did I complete?</span>
                  </p>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {rev.programsCompleted || "None recorded"}
                  </p>
                </div>

                {/* 3. Bugs Solved */}
                <div className="p-4 rounded-xl bg-dark-bg/60 border border-dark-border/80 space-y-1.5">
                  <p className="font-mono text-red-400 font-semibold flex items-center gap-1.5">
                    <Bug className="w-3.5 h-3.5" />
                    <span>3. What bugs did I solve?</span>
                  </p>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {rev.bugsSolved || "No bugs encountered"}
                  </p>
                </div>

                {/* 4. Unclear Topics */}
                <div className="p-4 rounded-xl bg-dark-bg/60 border border-dark-border/80 space-y-1.5">
                  <p className="font-mono text-amber-400 font-semibold flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>4. Which topics are still unclear?</span>
                  </p>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {rev.unclearTopics || "All topics clear"}
                  </p>
                </div>

                {/* 5. GitHub Commits */}
                <div className="p-4 rounded-xl bg-dark-bg/60 border border-dark-border/80 space-y-1.5">
                  <p className="font-mono text-gray-400 font-semibold flex items-center gap-1.5">
                    <Github className="w-3.5 h-3.5" />
                    <span>5. What did I commit to GitHub?</span>
                  </p>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {rev.githubCommits || "None"}
                  </p>
                </div>

                {/* 6. DSA Problems Solved */}
                <div className="p-4 rounded-xl bg-dark-bg/60 border border-dark-border/80 space-y-1.5">
                  <p className="font-mono text-neon-purple font-semibold flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5" />
                    <span>6. How many DSA problems did I solve?</span>
                  </p>
                  <p className="text-lg font-bold text-white font-mono">
                    {rev.dsaProblemsSolved} Problems
                  </p>
                </div>
              </div>

              {/* 7. Next Week's Most Important Goal (Full Width Highlight) */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-neon-cyan/10 to-neon-purple/10 border border-neon-cyan/30 space-y-1.5">
                <p className="font-mono text-neon-cyan font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span>7. Next Week's Most Important Goal</span>
                </p>
                <p className="text-sm font-semibold text-white leading-relaxed">
                  {rev.nextWeekGoal || "Maintain daily study consistency"}
                </p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center border-dashed border-dark-border space-y-3">
          <FileText className="w-8 h-8 text-gray-600 mx-auto" />
          <h4 className="text-sm font-semibold text-gray-300">No weekly reviews yet</h4>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Take 10 minutes every Sunday to audit your progress across all 7 guided reflection questions!
          </p>
        </Card>
      )}

      {/* Write / Edit Review Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-dark-card border border-dark-border shadow-2xl p-6 space-y-4 animate-slide-up max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-dark-border/80 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-neon-cyan tracking-wider">
                  Weekly Reflection
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {editingReviewId ? "Edit Weekly Review" : "Record Weekly Review"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Auto Aggregate Intelligence Banner */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Automated Weekly Progress Engine</span>
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Scan your study calendar hours, completed tasks, and solved DSA problems for this week.
                </p>
              </div>

              <Button
                type="button"
                size="sm"
                variant="emerald"
                loading={aggregating}
                onClick={handleAutoAggregate}
                className="shrink-0"
              >
                <span>⚡ Auto-Aggregate Activity</span>
              </Button>
            </div>

            {aggregateStats && (
              <div className="p-3 rounded-xl bg-[#0b1017] border border-emerald-500/40 text-[11px] font-mono text-gray-300 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center animate-fade-in">
                <div className="p-1.5 rounded-lg bg-dark-bg/60">
                  <span className="text-emerald-400 font-bold text-sm block">
                    {aggregateStats.totalStudyHours || "0"}h
                  </span>
                  <span className="text-gray-500 text-[10px]">Study Logged</span>
                </div>
                <div className="p-1.5 rounded-lg bg-dark-bg/60">
                  <span className="text-neon-cyan font-bold text-sm block">
                    {aggregateStats.dsaProblemsSolved || 0}
                  </span>
                  <span className="text-gray-500 text-[10px]">DSA Solved</span>
                </div>
                <div className="p-1.5 rounded-lg bg-dark-bg/60">
                  <span className="text-neon-purple font-bold text-sm block">
                    {aggregateStats.tasksCompleted || 0}
                  </span>
                  <span className="text-gray-500 text-[10px]">Tasks Done</span>
                </div>
                <div className="p-1.5 rounded-lg bg-dark-bg/60">
                  <span className="text-amber-400 font-bold text-sm block">
                    {aggregateStats.activeDaysCount || 0}/7
                  </span>
                  <span className="text-gray-500 text-[10px]">Active Days</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Week Start Date (Monday)"
                  type="date"
                  value={formData.weekStartDate}
                  onChange={(e) =>
                    setFormData({ ...formData, weekStartDate: e.target.value })
                  }
                  required
                />
                <Input
                  label="6. How many DSA problems did I solve?"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.dsaProblemsSolved}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dsaProblemsSolved: parseInt(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>

              {/* 1. Concepts Learned */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neon-cyan mb-1.5">
                  1. What concepts did I learn this week?
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Java Collections hierarchy, ArrayList vs LinkedList memory structure..."
                  value={formData.conceptsLearned}
                  onChange={(e) =>
                    setFormData({ ...formData, conceptsLearned: e.target.value })
                  }
                  className="w-full p-3 rounded-xl text-xs bg-dark-bg/90 border border-dark-border text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan/50"
                  required
                />
              </div>

              {/* 2. Programs / Features Completed */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-emerald-400 mb-1.5">
                  2. What programs or features did I complete?
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Implemented custom Comparator, built Student Grade Tracker..."
                  value={formData.programsCompleted}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      programsCompleted: e.target.value,
                    })
                  }
                  className="w-full p-3 rounded-xl text-xs bg-dark-bg/90 border border-dark-border text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan/50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* 3. Bugs Solved */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-red-400 mb-1.5">
                    3. What bugs did I solve?
                  </label>
                  <textarea
                    rows={2}
                    placeholder="NullPointerException in sorting, off-by-one loop error..."
                    value={formData.bugsSolved}
                    onChange={(e) =>
                      setFormData({ ...formData, bugsSolved: e.target.value })
                    }
                    className="w-full p-3 rounded-xl text-xs bg-dark-bg/90 border border-dark-border text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan/50"
                  />
                </div>

                {/* 4. Unclear Topics */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-amber-400 mb-1.5">
                    4. Which topics are still unclear?
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Generics type erasure, Wildcards (? extends T)..."
                    value={formData.unclearTopics}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        unclearTopics: e.target.value,
                      })
                    }
                    className="w-full p-3 rounded-xl text-xs bg-dark-bg/90 border border-dark-border text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan/50"
                  />
                </div>
              </div>

              {/* 5. GitHub Commits */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                  5. What did I commit to GitHub?
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pushed 12 LeetCode solutions, initialized Spring Boot auth branch"
                  value={formData.githubCommits}
                  onChange={(e) =>
                    setFormData({ ...formData, githubCommits: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl text-xs bg-dark-bg/90 border border-dark-border text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan/50 font-mono"
                />
              </div>

              {/* 7. Next Week Goal */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neon-cyan mb-1.5 font-bold">
                  7. What is next week's most important goal?
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Master Exception Handling hierarchy and solve 8 Medium String problems"
                  value={formData.nextWeekGoal}
                  onChange={(e) =>
                    setFormData({ ...formData, nextWeekGoal: e.target.value })
                  }
                  className="w-full p-3 rounded-xl text-xs bg-dark-bg/90 border border-neon-cyan/40 text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan focus:shadow-glow-cyan"
                  required
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
                  {editingReviewId ? "Save Changes" : "Save Review"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Fallback seed review
const mockReviews = [
  {
    id: 1,
    weekStartDate: "2026-11-10",
    conceptsLearned: "Java Collections Framework: ArrayList vs LinkedList, HashSet internal working with HashMap, Comparable vs Comparator.",
    programsCompleted: "Implemented custom LRU Cache using LinkedHashMap, solved 6 string problems.",
    bugsSolved: "ConcurrentModificationException when removing elements inside a foreach loop; resolved using Iterator.remove().",
    unclearTopics: "Java Generics wildcards bounded types (? extends Comparable). Need deeper practice.",
    githubCommits: "Commit 4a8b2: Completed Stage 1 Java collections exercises and DSA solutions.",
    dsaProblemsSolved: 8,
    nextWeekGoal: "Master SQL Joins, Subqueries and set up local PostgreSQL for Stage 3.",
  },
];
