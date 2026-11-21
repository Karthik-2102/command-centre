import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Clock,
  CheckSquare,
  Code2,
  FolderGit2,
  PieChart as PieIcon,
  TrendingUp,
  Award,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import Card from "../components/ui/Card";
import Spinner from "../components/ui/Spinner";
import api from "../api/axios";

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get("/analytics/summary");
      if (res.data?.success && res.data?.data) {
        setData(res.data.data);
      } else {
        setData(mockAnalytics);
      }
    } catch (err) {
      setData(mockAnalytics);
    } finally {
      setLoading(false);
    }
  };

  const mockAnalytics = {
    dailyAverageHours: 2.8,
    thisWeekHours: 15.0,
    thisMonthHours: 38.5,
    allTimeHours: 48.0,
    roadmapCompletionPercentage: 14,
    totalTopics: 51,
    completedTopics: 7,
    inProgressTopics: 2,
    notStartedTopics: 42,
    totalTasks: 28,
    completedTasks: 21,
    pendingTasks: 7,
    taskCompletionRate: 75,
    totalDsaSolved: 32,
    easyDsaSolved: 18,
    mediumDsaSolved: 12,
    hardDsaSolved: 2,
    dsaTopicDistribution: [
      { topic: "Arrays & Strings", count: 14 },
      { topic: "Hashing", count: 6 },
      { topic: "Two Pointers", count: 5 },
      { topic: "Recursion", count: 4 },
      { topic: "Binary Search", count: 3 },
    ],
    dsaDifficultyChart: [
      { difficulty: "Easy", count: 18, fill: "#10b981" },
      { difficulty: "Medium", count: 12, fill: "#eab308" },
      { difficulty: "Hard", count: 2, fill: "#ef4444" },
    ],
    totalProjects: 3,
    inProgressProjects: 1,
    completedProjects: 0,
  };

  const analytics = data || mockAnalytics;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Spinner size="lg" color="cyan" />
        <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">
          Synthesizing performance intelligence...
        </p>
      </div>
    );
  }

  const topicDonutData = [
    { name: "Completed", value: analytics.completedTopics, fill: "#10b981" },
    { name: "In Progress", value: analytics.inProgressTopics, fill: "#00f0ff" },
    { name: "Not Started", value: analytics.notStartedTopics, fill: "#374151" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 text-neon-cyan font-mono text-xs uppercase tracking-wider mb-1">
          <BarChart3 className="w-4 h-4" />
          <span>Performance Intelligence</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Analytics & Metrics
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Comprehensive quantitative evaluation of study hours, roadmap progress, DSA problems, and tasks.
        </p>
      </div>

      {/* Top Velocity Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hoverable className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono text-gray-400 uppercase">Daily Average</p>
              <p className="text-2xl font-bold text-neon-cyan mt-1 font-mono">
                {analytics.dailyAverageHours}h
              </p>
              <p className="text-xs text-gray-500 mt-1">Target: 3.0h / day</p>
            </div>
            <div className="p-3 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card hoverable className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono text-gray-400 uppercase">This Month</p>
              <p className="text-2xl font-bold text-white mt-1 font-mono">
                {analytics.thisMonthHours}h
              </p>
              <p className="text-xs text-gray-500 mt-1">All-time: {analytics.allTimeHours}h</p>
            </div>
            <div className="p-3 rounded-xl bg-neon-purple/10 border border-neon-purple/30 text-neon-purple">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card hoverable className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono text-gray-400 uppercase">Task Completion</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
                {analytics.taskCompletionRate}%
              </p>
              <p className="text-xs text-gray-500 mt-1">{analytics.completedTasks} of {analytics.totalTasks} tasks done</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card hoverable className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono text-gray-400 uppercase">DSA Solved</p>
              <p className="text-2xl font-bold text-amber-400 mt-1 font-mono">
                {analytics.totalDsaSolved}
              </p>
              <p className="text-xs text-gray-500 mt-1">E: {analytics.easyDsaSolved} &bull; M: {analytics.mediumDsaSolved} &bull; H: {analytics.hardDsaSolved}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Code2 className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Roadmap Topics Donut Chart */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Roadmap Topic Distribution</h3>
              <p className="text-xs text-gray-400">Total 51 topics across 6 curriculum stages</p>
            </div>
            <span className="text-xs font-mono text-neon-cyan px-2.5 py-1 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30">
              {analytics.roadmapCompletionPercentage}% Complete
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topicDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {topicDonutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111119",
                    borderColor: "#1e1e2e",
                    borderRadius: "12px",
                    color: "#f3f4f6",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  formatter={(value) => (
                    <span className="text-xs text-gray-300 font-mono">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* DSA Difficulty Breakdown */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">DSA Solved by Difficulty</h3>
              <p className="text-xs text-gray-400">Targeting solid problem-solving foundation</p>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.dsaDifficultyChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                <XAxis dataKey="difficulty" stroke="#6b7280" fontSize={12} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111119",
                    borderColor: "#1e1e2e",
                    borderRadius: "12px",
                    color: "#f3f4f6",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {analytics.dsaDifficultyChart.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* DSA Topic Breakdown Distribution */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-white">DSA Topics Solved</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {analytics.dsaTopicDistribution.map((t, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-dark-bg/60 border border-dark-border/80 text-center"
            >
              <p className="text-xs text-gray-400 truncate">{t.topic}</p>
              <p className="text-lg font-bold text-neon-cyan font-mono mt-1">{t.count}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
