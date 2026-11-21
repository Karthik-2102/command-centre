export const PRIORITIES = {
  HIGH: { label: "High", color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/30" },
  MEDIUM: { label: "Medium", color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/30" },
  LOW: { label: "Low", color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/30" },
};

export const TOPIC_STATUS = {
  NOT_STARTED: { label: "Not Started", color: "text-gray-400", bg: "bg-gray-400/10" },
  IN_PROGRESS: { label: "In Progress", color: "text-neon-cyan", bg: "bg-neon-cyan/10" },
  COMPLETED: { label: "Completed", color: "text-green-400", bg: "bg-green-400/10" },
};

export const DSA_DIFFICULTY = {
  EASY: { label: "Easy", color: "text-green-400", bg: "bg-green-400/10" },
  MEDIUM: { label: "Medium", color: "text-yellow-400", bg: "bg-yellow-400/10" },
  HARD: { label: "Hard", color: "text-red-400", bg: "bg-red-400/10" },
};

export const PROJECT_STATUS = {
  PLANNED: { label: "Planned", color: "text-gray-400" },
  IN_PROGRESS: { label: "In Progress", color: "text-neon-cyan" },
  COMPLETED: { label: "Completed", color: "text-green-400" },
  ON_HOLD: { label: "On Hold", color: "text-yellow-400" },
};

export const JOB_STATUS = {
  APPLIED: { label: "Applied", color: "text-blue-400" },
  IN_REVIEW: { label: "In Review", color: "text-yellow-400" },
  INTERVIEW: { label: "Interview", color: "text-neon-purple" },
  OFFERED: { label: "Offered", color: "text-green-400" },
  REJECTED: { label: "Rejected", color: "text-red-400" },
  ACCEPTED: { label: "Accepted", color: "text-neon-cyan" },
};

export const SIDEBAR_ITEMS = [
  { key: "overview", label: "Overview", icon: "LayoutDashboard" },
  { key: "roadmap", label: "Learning Roadmap", icon: "Map" },
  { key: "tasks", label: "My Tasks", icon: "CheckSquare" },
  { key: "dsa", label: "DSA Practice", icon: "Code2" },
  { key: "projects", label: "Projects", icon: "FolderGit2" },
  { key: "calendar", label: "Study Calendar", icon: "Calendar" },
  { key: "career", label: "Career Preparation", icon: "Briefcase" },
  { key: "analytics", label: "Analytics", icon: "BarChart3" },
  { key: "reviews", label: "Weekly Reviews", icon: "FileText" },
  { key: "settings", label: "Settings", icon: "Settings" },
];
