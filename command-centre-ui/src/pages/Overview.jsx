import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Clock,
  CheckCircle2,
  Code2,
  FolderGit2,
  Flame,
  ArrowRight,
  Sparkles,
  Target,
  BookOpen,
  Calendar,
  AlertCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import Card from "../components/ui/Card";
import Spinner from "../components/ui/Spinner";
import JobReadinessCard from "../components/JobReadinessCard";
import GitHubHeatmapCard from "../components/GitHubHeatmapCard";
import api from "../api/axios";
import { PRIORITIES } from "../utils/constants";

export default function Overview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverviewStats();
  }, []);

  const fetchOverviewStats = async () => {
    try {
      setLoading(true);
      const res = await api.get("/overview/stats");
      if (res.data?.success && res.data?.data) {
        setStats(res.data.data);
      } else {
        setStats(defaultMockStats);
      }
    } catch (err) {
      // Fallback to rich preview data if API is loading or empty
      setStats(defaultMockStats);
    } finally {
      setLoading(false);
    }
  };

  const defaultMockStats = {
    overallProgressPercentage: 14,
    currentStageTitle: "Java Fundamentals",
    currentStageNumber: 1,
    currentMonth: "Month 1",
    totalStudyHours: 18.5,
    todayStudyHours: 2.5,
    weeklyStudyHours: 15.0,
    completedTopics: 7,
    inProgressTopics: 2,
    pendingTopics: 42,
    totalTopics: 51,
    dsaProblemsSolved: 24,
    activeProjects: 1,
    currentStreakDays: 6,
    todayPriorities: [
      {
        id: 1,
        title: "OOP: Encapsulation & Access Modifiers",
        priority: "HIGH",
        category: "Study",
        status: "PENDING",
      },
      {
        id: 2,
        title: "Solve 2 LeetCode String Problems in Java",
        priority: "HIGH",
        category: "DSA",
        status: "PENDING",
      },
      {
        id: 3,
        title: "PostgreSQL: Joins & Subqueries practice",
        priority: "MEDIUM",
        category: "Database",
        status: "COMPLETED",
      },
    ],
    weeklyStudyChart: [
      { day: "Mon", hours: 3.5, targetHours: 3.0 },
      { day: "Tue", hours: 3.0, targetHours: 3.0 },
      { day: "Wed", hours: 2.5, targetHours: 3.0 },
      { day: "Thu", hours: 4.0, targetHours: 3.0 },
      { day: "Fri", hours: 3.0, targetHours: 3.0 },
      { day: "Sat", hours: 2.0, targetHours: 3.0 },
      { day: "Sun", hours: 0.0, targetHours: 3.0 },
    ],
    stageProgressChart: [
      { stage: "Stage 1", title: "Java Fundamentals", percentage: 100 },
      { stage: "Stage 2", title: "OOP & Collections", percentage: 40 },
      { stage: "Stage 3", title: "SQL & Git", percentage: 0 },
      { stage: "Stage 4", title: "Spring Boot", percentage: 0 },
      { stage: "Stage 5", title: "Projects", percentage: 0 },
      { stage: "Stage 6", title: "Advanced & Career", percentage: 0 },
    ],
  };

  const data = stats || defaultMockStats;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Spinner size="lg" color="cyan" />
        <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">
          Loading command centre telemetry...
        </p>
      </div>
    );
  }

  const kpis = [
    {
      title: "Study Hours Logged",
      value: `${data.totalStudyHours}h`,
      subtitle: `Target: 3.0h / day (${data.weeklyStudyHours}h this week)`,
      icon: Clock,
      color: "text-neon-cyan",
      border: "border-neon-cyan/40",
      glow: "shadow-glow-cyan",
    },
    {
      title: "Topics Completed",
      value: `${data.completedTopics} / ${data.totalTopics}`,
      subtitle: `${data.inProgressTopics} in progress &bull; ${data.overallProgressPercentage}% completed`,
      icon: CheckCircle2,
      color: "text-emerald-400",
      border: "border-emerald-500/40",
      glow: "shadow-[0_0_20px_rgba(16,185,129,0.15)]",
    },
    {
      title: "DSA Solved",
      value: `${data.dsaProblemsSolved}`,
      subtitle: "Problems tracked with complexity",
      icon: Code2,
      color: "text-neon-purple",
      border: "border-neon-purple/40",
      glow: "shadow-glow-purple",
    },
    {
      title: "Consistency Streak",
      value: `${data.currentStreakDays} Days`,
      subtitle: "Daily study streak maintained",
      icon: Flame,
      color: "text-amber-400",
      border: "border-amber-500/40",
      glow: "shadow-[0_0_20px_rgba(245,158,11,0.15)]",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner: Stage Telemetry */}
      <Card className="p-6 border-neon-cyan/30 shadow-glow-cyan bg-gradient-to-r from-dark-card via-dark-card to-dark-bg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-neon-cyan/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neon-cyan/15 border border-neon-cyan/30 text-neon-cyan text-xs font-mono">
                <Target className="w-3.5 h-3.5" />
                <span>Stage {data.currentStageNumber} of 6 &bull; {data.currentMonth}</span>
              </span>
              <span className="text-xs text-gray-500 font-mono">
                10-Month Timeline
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Current Mission: {data.currentStageTitle}
            </h2>

            <p className="text-xs sm:text-sm text-gray-400 max-w-2xl leading-relaxed">
              Mastering the core fundamentals of backend engineering. Maintain your 3 hours daily target to transition from beginner to job-ready software engineer.
            </p>
          </div>

          <div className="flex items-center gap-6 shrink-0 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 border-dark-border/60 pt-4 lg:pt-0">
            <div className="text-left lg:text-right">
              <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">
                Overall Progress
              </span>
              <p className="text-3xl font-extrabold text-neon-cyan font-mono">
                {data.overallProgressPercentage}%
              </p>
            </div>

            <Link
              to="/roadmap"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neon-cyan/10 border border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan hover:text-dark-bg font-semibold text-xs transition-all duration-300 shadow-glow-cyan"
            >
              <span>View Roadmap</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </Card>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} hoverable className="p-5 relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                    {kpi.title}
                  </p>
                  <p className="text-2xl font-bold text-white mt-1.5 font-mono">
                    {kpi.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 leading-snug">
                    {kpi.subtitle}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-xl bg-dark-bg/80 border ${kpi.border} ${kpi.color} ${kpi.glow}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Two Column Section: Interactive Charts & Priorities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Study Hours Area Chart (2 Cols) */}
        <Card className="p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Weekly Study Hours Telemetry
                </h3>
                <p className="text-xs text-gray-400">
                  Target: 3.0 Hours / Day &bull; Actual vs Recommended
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-neon-cyan">
                <span className="w-2.5 h-2.5 rounded-full bg-neon-cyan" />
                <span>Logged</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-600" />
                <span>Target</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.weeklyStudyChart}>
                <defs>
                  <linearGradient id="hourGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                <XAxis
                  dataKey="day"
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  unit="h"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111119",
                    borderColor: "#1e1e2e",
                    borderRadius: "12px",
                    color: "#f3f4f6",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="hours"
                  stroke="#00f0ff"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#hourGlow)"
                />
                <Area
                  type="monotone"
                  dataKey="targetHours"
                  stroke="#4b5563"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  fill="none"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Today's Priorities Checklist (1 Col) */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-neon-purple/10 text-neon-purple border border-neon-purple/30">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Today's Priorities
                </h3>
                <p className="text-xs text-gray-400">High-focus daily action items</p>
              </div>
            </div>

            <Link
              to="/tasks"
              className="text-xs text-neon-cyan hover:underline font-mono"
            >
              All Tasks
            </Link>
          </div>

          <div className="space-y-2.5 pt-2">
            {data.todayPriorities && data.todayPriorities.length > 0 ? (
              data.todayPriorities.map((task) => {
                const priorityConfig = PRIORITIES[task.priority] || PRIORITIES.MEDIUM;
                const isCompleted = task.status === "COMPLETED";

                return (
                  <div
                    key={task.id}
                    className="p-3 rounded-xl bg-dark-bg/70 border border-dark-border/80 flex items-start gap-3 transition-colors hover:border-neon-cyan/30"
                  >
                    <div
                      className={`w-4 h-4 rounded-md border mt-0.5 flex items-center justify-center shrink-0 ${
                        isCompleted
                          ? "bg-emerald-500 border-emerald-500 text-dark-bg"
                          : "border-gray-500"
                      }`}
                    >
                      {isCompleted && <CheckCircle2 className="w-3 h-3 text-dark-bg" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-medium leading-snug truncate ${
                          isCompleted
                            ? "text-gray-500 line-through"
                            : "text-gray-200"
                        }`}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${priorityConfig.bg} ${priorityConfig.color}`}
                        >
                          {priorityConfig.label}
                        </span>
                        {task.category && (
                          <span className="text-[10px] text-gray-500 font-mono">
                            {task.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500 text-xs">
                No priority tasks due today.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Job Readiness Scorecard & GitHub Heatmap Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <JobReadinessCard
          roadmapPct={data.overallProgressPercentage || 15}
          dsaSolved={data.dsaProblemsSolved || 12}
          dsaTarget={150}
          projectsDone={data.activeProjectsCount || 1}
          projectsTarget={4}
        />
        <GitHubHeatmapCard />
      </div>

      {/* Stage Breakdown Progress Chart */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                10-Month Roadmap Stage Mastery
              </h3>
              <p className="text-xs text-gray-400">
                Progression across all 6 sequential stages of backend engineering
              </p>
            </div>
          </div>
        </div>

        <div className="h-60 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.stageProgressChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
              <XAxis dataKey="stage" stroke="#6b7280" fontSize={12} tickLine={false} />
              <YAxis stroke="#6b7280" fontSize={12} tickLine={false} unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111119",
                  borderColor: "#1e1e2e",
                  borderRadius: "12px",
                  color: "#f3f4f6",
                  fontSize: "12px",
                }}
              />
              <Bar
                dataKey="percentage"
                fill="#a855f7"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
