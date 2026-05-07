import type { LucideIcon } from "lucide-react"
import {
  LayoutDashboard,
  Bell,
  BrainCircuit,
  Zap,
  GitBranch,
  RotateCcw,
  FileText,
  Database,
  Settings,
} from "lucide-react"

export const tabKeys = [
  "overview",
  "alerts",
  "decisions",
  "simulator",
  "root-cause",
  "replay",
  "reports",
  "assets",
  "settings",
] as const

export type TabKey = (typeof tabKeys)[number]

export interface NavigationItem {
  tab: TabKey
  label: string
  icon: LucideIcon
  badge?: number
}

export interface TabMeta {
  title: string
  subtitle: string
  bannerTitle: string
  bannerSubtitle: string
  bannerTag: string
  bannerTime: string
  statusLabel: string
  statusDetail: string
  notificationCount: number
  bannerClass: string
  statusClass: string
}

export const navigationItems: NavigationItem[] = [
  { tab: "overview", icon: LayoutDashboard, label: "Overview" },
  { tab: "alerts", icon: Bell, label: "Alerts", badge: 3 },
  { tab: "decisions", icon: BrainCircuit, label: "Decisions" },
  { tab: "simulator", icon: Zap, label: "Simulator" },
  { tab: "root-cause", icon: GitBranch, label: "Root Cause" },
  { tab: "replay", icon: RotateCcw, label: "Replay" },
  { tab: "reports", icon: FileText, label: "Reports" },
  { tab: "assets", icon: Database, label: "Assets" },
  { tab: "settings", icon: Settings, label: "Settings" },
]

export const tabMeta: Record<TabKey, TabMeta> = {
  overview: {
    title: "Overview",
    subtitle: "Operational pulse, active alerts, and live trend telemetry.",
    bannerTitle: "Critical Alert: High Pressure Detected in Pump P-101",
    bannerSubtitle: "Overview mode is centered on live plant telemetry and incident watch.",
    bannerTag: "Urgent",
    bannerTime: "10:24 AM",
    statusLabel: "System Operational",
    statusDetail: "11 modules synchronized",
    notificationCount: 3,
    bannerClass: "bg-rose-600 ring-rose-500",
    statusClass: "bg-emerald-50 border-emerald-200 text-emerald-800",
  },
  alerts: {
    title: "Alerts",
    subtitle: "Incoming alarms, triage priority, and resolution queues.",
    bannerTitle: "Live Alert Queue: 3 incidents require triage",
    bannerSubtitle: "Alerts tab surfaces the current warning stream and severity mix.",
    bannerTag: "Triage",
    bannerTime: "Live feed",
    statusLabel: "Alert Center",
    statusDetail: "3 critical items in focus",
    notificationCount: 12,
    bannerClass: "bg-rose-700 ring-rose-500",
    statusClass: "bg-rose-50 border-rose-200 text-rose-800",
  },
  decisions: {
    title: "Decisions",
    subtitle: "AI recommendations, confidence paths, and chosen interventions.",
    bannerTitle: "AI Decision Studio: recommended intervention ready",
    bannerSubtitle: "Decision logic is assembled from the latest sensor cluster and risk model.",
    bannerTag: "92% confidence",
    bannerTime: "Decision cycle 04",
    statusLabel: "Decision Engine",
    statusDetail: "2 options promoted to operator review",
    notificationCount: 5,
    bannerClass: "bg-blue-600 ring-blue-500",
    statusClass: "bg-blue-50 border-blue-200 text-blue-800",
  },
  simulator: {
    title: "Simulator",
    subtitle: "Scenario playback, parameter testing, and predicted outcomes.",
    bannerTitle: "Simulation Console: predictive run staged",
    bannerSubtitle: "The UI shows a mock process run with live-looking controls and forecasted results.",
    bannerTag: "Dry Run",
    bannerTime: "Scenario B",
    statusLabel: "Simulation Ready",
    statusDetail: "3 inputs connected to preview",
    notificationCount: 1,
    bannerClass: "bg-violet-600 ring-violet-500",
    statusClass: "bg-violet-50 border-violet-200 text-violet-800",
  },
  "root-cause": {
    title: "Root Cause",
    subtitle: "Animated causal chain, evidence nodes, and confidence mapping.",
    bannerTitle: "Root Cause Animation: causal chain in motion",
    bannerSubtitle: "This workspace visually connects the blockage, pressure rise, and downstream impact.",
    bannerTag: "Causal Map",
    bannerTime: "Correlation path",
    statusLabel: "Causal Analysis",
    statusDetail: "Root node resolved with 4 supporting signals",
    notificationCount: 4,
    bannerClass: "bg-amber-600 ring-amber-500",
    statusClass: "bg-amber-50 border-amber-200 text-amber-800",
  },
  replay: {
    title: "Replay",
    subtitle: "Event playback, annotations, and timeline scrub controls.",
    bannerTitle: "Event Replay Timeline: incident playback loaded",
    bannerSubtitle: "Replay mode highlights the timeline, timestamps, and operator annotations.",
    bannerTag: "Playback",
    bannerTime: "10:24 AM",
    statusLabel: "Replay Active",
    statusDetail: "Playback head pinned to critical event",
    notificationCount: 2,
    bannerClass: "bg-slate-700 ring-slate-500",
    statusClass: "bg-slate-50 border-slate-200 text-slate-800",
  },
  reports: {
    title: "Reports",
    subtitle: "Daily summaries, exports, and performance review dashboards.",
    bannerTitle: "Operational Reports: digest ready for export",
    bannerSubtitle: "Reports aggregates the most important trend lines and incident summaries.",
    bannerTag: "Export",
    bannerTime: "Daily digest",
    statusLabel: "Reporting Hub",
    statusDetail: "4 snapshots generated",
    notificationCount: 6,
    bannerClass: "bg-cyan-700 ring-cyan-500",
    statusClass: "bg-cyan-50 border-cyan-200 text-cyan-800",
  },
  assets: {
    title: "Assets",
    subtitle: "Fleet health, maintenance windows, and machine inventory.",
    bannerTitle: "Asset Health: 24 connected machines",
    bannerSubtitle: "Assets tab maps each machine to a health score and maintenance state.",
    bannerTag: "Fleet",
    bannerTime: "24 nodes",
    statusLabel: "Fleet View",
    statusDetail: "2 maintenance windows pending",
    notificationCount: 7,
    bannerClass: "bg-emerald-700 ring-emerald-500",
    statusClass: "bg-emerald-50 border-emerald-200 text-emerald-800",
  },
  settings: {
    title: "Settings",
    subtitle: "Controls, policies, notification routing, and simulation presets.",
    bannerTitle: "System Settings: policy profiles synced",
    bannerSubtitle: "Settings keeps the mock interface coherent across alerting and simulation modes.",
    bannerTag: "Admin",
    bannerTime: "Sync complete",
    statusLabel: "Control Room",
    statusDetail: "Changes staged in preview mode",
    notificationCount: 0,
    bannerClass: "bg-zinc-700 ring-zinc-500",
    statusClass: "bg-zinc-50 border-zinc-200 text-zinc-800",
  },
}
