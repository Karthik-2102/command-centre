import React from "react";
import { ShieldCheck, Award, TrendingUp, CheckCircle2, ChevronRight, Zap } from "lucide-react";
import Card from "./ui/Card";
import { Link } from "react-router-dom";

export default function JobReadinessCard({
  roadmapPct = 15,
  dsaSolved = 12,
  dsaTarget = 150,
  projectsDone = 1,
  projectsTarget = 4,
}) {
  // Weights: Roadmap 40%, DSA 30%, Projects 20%, Consistency 10%
  const roadmapScore = Math.min(40, (roadmapPct / 100) * 40);
  const dsaScore = Math.min(30, (dsaSolved / dsaTarget) * 30);
  const projectScore = Math.min(20, (projectsDone / projectsTarget) * 20);
  const consistencyScore = 8; // baseline 8%

  const totalScore = Math.round(roadmapScore + dsaScore + projectScore + consistencyScore);

  const getTier = (score) => {
    if (score < 25) return { title: "Apprentice Foundation", color: "text-amber-400", badge: "bg-amber-500/10 border-amber-500/30 text-amber-400" };
    if (score < 55) return { title: "Backend Core Builder", color: "text-neon-cyan", badge: "bg-neon-cyan/10 border-neon-cyan/30 text-neon-cyan" };
    if (score < 80) return { title: "Production Ready", color: "text-neon-purple", badge: "bg-neon-purple/10 border-neon-purple/30 text-neon-purple" };
    return { title: "Job Ready Engineer", color: "text-emerald-400", badge: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" };
  };

  const tier = getTier(totalScore);

  return (
    <Card hoverable className="p-6 relative overflow-hidden group">
      {/* Background ambient glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-neon-cyan/10 rounded-full blur-2xl pointer-events-none transition-transform duration-500 group-hover:scale-125" />

      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-neon-cyan" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Job Readiness Scorecard
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-0.5 font-mono">
            Full-Stack Backend Career Probability
          </p>
        </div>

        <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border ${tier.badge}`}>
          {tier.title}
        </span>
      </div>

      {/* Big Score & Gauge */}
      <div className="flex items-baseline gap-2 my-3">
        <span className="text-4xl font-extrabold font-mono text-white tracking-tight">
          {totalScore}%
        </span>
        <span className="text-xs text-gray-400 font-mono">
          / 100% Industry Benchmark
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full bg-dark-bg border border-dark-border overflow-hidden mb-5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-neon-cyan via-sky-400 to-neon-purple transition-all duration-1000"
          style={{ width: `${Math.max(5, totalScore)}%` }}
        />
      </div>

      {/* Factor Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-2.5 rounded-xl bg-dark-bg/60 border border-dark-border/80">
          <span className="text-gray-400 block text-[10px]">Roadmap (40%)</span>
          <span className="text-white font-bold text-xs mt-0.5 block">{roadmapPct}%</span>
          <span className="text-[10px] text-neon-cyan">+{roadmapScore.toFixed(0)} pts</span>
        </div>

        <div className="p-2.5 rounded-xl bg-dark-bg/60 border border-dark-border/80">
          <span className="text-gray-400 block text-[10px]">DSA Solved (30%)</span>
          <span className="text-white font-bold text-xs mt-0.5 block">{dsaSolved} / {dsaTarget}</span>
          <span className="text-[10px] text-neon-cyan">+{dsaScore.toFixed(0)} pts</span>
        </div>

        <div className="p-2.5 rounded-xl bg-dark-bg/60 border border-dark-border/80">
          <span className="text-gray-400 block text-[10px]">Projects (20%)</span>
          <span className="text-white font-bold text-xs mt-0.5 block">{projectsDone} / {projectsTarget}</span>
          <span className="text-[10px] text-neon-purple">+{projectScore.toFixed(0)} pts</span>
        </div>

        <div className="p-2.5 rounded-xl bg-dark-bg/60 border border-dark-border/80">
          <span className="text-gray-400 block text-[10px]">Consistency (10%)</span>
          <span className="text-white font-bold text-xs mt-0.5 block">High</span>
          <span className="text-[10px] text-emerald-400">+8 pts</span>
        </div>
      </div>

      {/* Next Target Action */}
      <div className="mt-4 pt-3 border-t border-dark-border/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-gray-300">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Next milestone: Complete Stage 1 & solve 15 Arrays problems</span>
        </div>
        <Link
          to="/roadmap"
          className="text-neon-cyan hover:text-cyan-300 font-mono text-[11px] flex items-center gap-1 transition-colors"
        >
          <span>View Sprint</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </Card>
  );
}
