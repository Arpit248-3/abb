import {
  Activity,
  ArrowRight,
  Bell,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Database,
  FileText,
  Gauge,
  GitBranch,
  HardDrive,
  Layers3,
  MonitorPlay,
  Play,
  Radar,
  RotateCcw,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  TrendingUp,
  Waves,
  Zap,
} from "lucide-react"

import type { ComponentType, ReactNode } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertsChart } from "@/components/dashboard/AlertsChart"
import { AlertsTable } from "@/components/dashboard/AlertsTable"
import { AIExplanation } from "@/components/dashboard/AIExplanation"
import { AIRecPanel } from "@/components/dashboard/AIRecPanel"
import { ProcessOverview } from "@/components/dashboard/ProcessOverview"
import { ReplayTimeline } from "@/components/dashboard/ReplayTimeline"
import { RootCauseFlow } from "@/components/dashboard/RootCauseFlow"
import { StatCards } from "@/components/dashboard/StatCards"
import { SystemTrendChart } from "@/components/dashboard/SystemTrendChart"
import type { TabKey } from "@/lib/dashboard-navigation"
import { DecisionOSView } from "@/components/dashboard/DecisionOSView"


function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  accent,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
  detail: string
  accent: string
}) {
  return (
    <Card className="border border-zinc-200 shadow-md bg-white overflow-hidden">
      <CardContent className="p-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${accent} shadow-sm`} />
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">{label}</p>
          </div>
          <div className="mt-3 text-3xl font-black text-zinc-900 leading-none">{value}</div>
          <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-zinc-500">{detail}</p>
        </div>
        <div className={`p-3 rounded-2xl border ${accent.replace("bg-", "border-")}/30 bg-white shadow-sm`}>
          <Icon className="w-5 h-5 text-zinc-500" />
        </div>
      </CardContent>
    </Card>
  )
}

function SectionCard({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string
  subtitle: string
  children: ReactNode
  className?: string
}) {
  return (
    <Card className={`border border-zinc-200 shadow-md bg-white ${className}`}>
      <CardHeader className="p-5 pb-2">
        <CardTitle className="text-sm font-black text-zinc-500 uppercase tracking-widest leading-none">{title}</CardTitle>
        <p className="text-xs text-zinc-400 font-black mt-1.5 uppercase tracking-tight leading-none">{subtitle}</p>
      </CardHeader>
      <CardContent className="p-5 pt-3">{children}</CardContent>
    </Card>
  )
}

const alertQueue = [
  { asset: "P-101", issue: "High Pressure Detected", severity: "Critical", progress: 92, time: "10:24 AM" },
  { asset: "V-205", issue: "Valve Timing Drift", severity: "High", progress: 68, time: "10:18 AM" },
  { asset: "T-301", issue: "Temperature Rise", severity: "Medium", progress: 54, time: "09:55 AM" },
  { asset: "F-401", issue: "Flow Sensor Noise", severity: "Low", progress: 28, time: "09:42 AM" },
]

const decisionCards = [
  { label: "Reduce inlet valve opening", score: "92%", impact: "High", effort: "Low" },
  { label: "Increase bypass flow", score: "68%", impact: "Medium", effort: "Low" },
  { label: "Start auxiliary pump P-202", score: "54%", impact: "High", effort: "Medium" },
]

const simulationSteps = [
  { title: "Sensor input", detail: "Pressure spike + flow imbalance", value: "1.0x" },
  { title: "Model run", detail: "Predictive response branch", value: "4.2s" },
  { title: "Outcome", detail: "Pressure stabilizes if valve is trimmed", value: "-18%" },
]

const rootCauseSignals = [
  { label: "Line L-203 blockage", value: "Primary cause", tone: "bg-amber-500" },
  { label: "Inlet flow overshoot", value: "Supporting signal", tone: "bg-rose-500" },
  { label: "Pump oscillation", value: "Secondary signal", tone: "bg-blue-500" },
  { label: "Valve delay", value: "Correlation", tone: "bg-emerald-500" },
]

const reportCards = [
  { label: "Incidents resolved", value: "18", detail: "+7% vs yesterday", icon: CheckCircle2, color: "bg-emerald-500" },
  { label: "Open actions", value: "5", detail: "2 overdue", icon: Bell, color: "bg-rose-500" },
  { label: "Avg response", value: "6.4m", detail: "Fastest at 3.1m", icon: Clock3, color: "bg-blue-500" },
]

const assetCards = [
  { name: "Pump P-101", state: "Critical", health: 34, icon: Waves, color: "bg-rose-500" },
  { name: "Valve V-205", state: "Watch", health: 71, icon: Target, color: "bg-orange-500" },
  { name: "Tank T-101", state: "Healthy", health: 92, icon: HardDrive, color: "bg-emerald-500" },
  { name: "Feed Line L-203", state: "Investigate", health: 48, icon: GitBranch, color: "bg-blue-500" },
]

const settingsGroups = [
  { title: "Alert thresholds", items: ["Pressure", "Temperature", "Flow"], accent: "bg-rose-500" },
  { title: "Notification routing", items: ["Control room", "Email", "Mobile push"], accent: "bg-blue-500" },
  { title: "Simulation presets", items: ["Conservative", "Balanced", "Aggressive"], accent: "bg-violet-500" },
]

function OverviewView() {
  return <DecisionOSView />
}

function AlertsView() {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-2">
        <MetricCard icon={Bell} label="Open alerts" value="12" detail="3 critical in triage" accent="bg-rose-500" />
        <MetricCard icon={Activity} label="Active signals" value="41" detail="Across 8 connected assets" accent="bg-blue-500" />
        <MetricCard icon={ShieldCheck} label="Resolved today" value="18" detail="Fastest case in 3.1 min" accent="bg-emerald-500" />
        <MetricCard icon={TrendingUp} label="Escalation rate" value="9%" detail="Stable over last 24h" accent="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-2">
        <SectionCard title="Alert queue" subtitle="Ranked by severity and current impact" className="xl:col-span-4">
          <div className="space-y-3">
            {alertQueue.map((item) => (
              <div key={item.asset} className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-black text-zinc-900 uppercase tracking-tight">{item.asset}</div>
                    <div className="text-base font-black text-rose-600 leading-tight mt-1">{item.issue}</div>
                  </div>
                  <Badge className={`border-0 text-white font-black uppercase ${item.severity === "Critical" ? "bg-rose-600" : item.severity === "High" ? "bg-orange-500" : item.severity === "Medium" ? "bg-yellow-500" : "bg-emerald-600"}`}>
                    {item.severity}
                  </Badge>
                </div>
                <div className="mt-4 h-2 rounded-full bg-zinc-200 overflow-hidden">
                  <div className={`h-full rounded-full ${item.severity === "Critical" ? "bg-rose-500" : item.severity === "High" ? "bg-orange-500" : item.severity === "Medium" ? "bg-yellow-500" : "bg-emerald-500"}`} style={{ width: `${item.progress}%` }} />
                </div>
                <div className="mt-3 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
                  <span>Queued {item.time}</span>
                  <span>{item.progress}% impact score</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <div className="xl:col-span-4 min-h-[360px]">
          <AlertsChart />
        </div>

        <SectionCard title="Response lanes" subtitle="Mock triage action stream and ownership" className="xl:col-span-4">
          <div className="space-y-4">
            {[
              ["Operator", "Acknowledged P-101 and opened diagnostic context"],
              ["AI engine", "Suggested valve trim and bypass check"],
              ["Maintenance", "Standby team aligned on watchful response"],
            ].map(([role, note], index) => (
              <div key={role} className="flex items-start gap-3">
                <div className="mt-1 w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-black shadow-md">
                  {index + 1}
                </div>
                <div className="flex-1 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">{role}</span>
                    <ChevronRight className="w-4 h-4 text-zinc-300" />
                  </div>
                  <p className="mt-2 text-sm font-medium text-zinc-700 leading-relaxed">{note}</p>
                </div>
              </div>
            ))}
            <div className="rounded-2xl border border-rose-100 bg-rose-50/80 p-4">
              <div className="flex items-center gap-2 text-rose-700 font-black uppercase tracking-[0.18em] text-[10px]">
                <Sparkles className="w-4 h-4" /> Alert recommendation
              </div>
              <p className="mt-2 text-sm font-medium text-zinc-700 leading-relaxed">Reduce inlet pressure, validate valve V-205 response, and keep the incident in watch mode until the feed line clears.</p>
            </div>
          </div>
        </SectionCard>
      </div>

      <AlertsTable />
    </div>
  )
}

function DecisionsView() {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-2">
        <MetricCard icon={BrainCircuit} label="Decision confidence" value="92%" detail="Model support is strong" accent="bg-blue-500" />
        <MetricCard icon={Target} label="Recommended action" value="1" detail="Reduce inlet valve opening" accent="bg-emerald-500" />
        <MetricCard icon={RotateCcw} label="Alternatives" value="3" detail="Scenario comparison ready" accent="bg-violet-500" />
        <MetricCard icon={Zap} label="Decision latency" value="4.2s" detail="Prediction + validation" accent="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-2">
        <SectionCard title="AI recommendation stack" subtitle="Ranked proposals with confidence and effort" className="xl:col-span-7">
          <div className="space-y-3">
            {decisionCards.map((card, index) => (
              <div key={card.label} className={`rounded-2xl border-2 p-4 ${index === 0 ? "border-emerald-500 bg-emerald-50/80 shadow-lg ring-4 ring-emerald-100/50" : "border-zinc-200 bg-zinc-50/60"}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Recommendation {index + 1}</p>
                    <h3 className="mt-2 text-lg font-black text-zinc-900 leading-tight">{card.label}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Confidence</p>
                    <p className="mt-1 text-2xl font-black text-zinc-900">{card.score}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
                  <span>Impact {card.impact}</span>
                  <span>Effort {card.effort}</span>
                  <span>{index === 0 ? "Primary path" : "Fallback path"}</span>
                </div>
                <div className="mt-4 h-2 rounded-full bg-zinc-200 overflow-hidden">
                  <div className={`h-full rounded-full ${index === 0 ? "bg-emerald-500 w-[92%]" : index === 1 ? "bg-blue-500 w-[68%]" : "bg-violet-500 w-[54%]"}`} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Decision path" subtitle="How the AI moved from signal to action" className="xl:col-span-5">
          <div className="space-y-4">
            {[
              { label: "Signals in", detail: "Pressure, flow, and valve drift" },
              { label: "Guardrails", detail: "Checked against safe operating limits" },
              { label: "Action chosen", detail: "Trim inlet valve for pressure relief" },
            ].map((step, index) => (
              <div key={step.label} className="flex items-start gap-3">
                <div className="mt-1 w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-md">
                  {index + 1}
                </div>
                <div className="flex-1 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 shadow-sm">
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">{step.label}</div>
                  <p className="mt-2 text-sm text-zinc-700 font-medium leading-relaxed">{step.detail}</p>
                </div>
              </div>
            ))}
            <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 p-5 text-white shadow-xl">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/80">
                <BrainCircuit className="w-4 h-4" /> AI final decision
              </div>
              <div className="mt-2 text-xl font-black leading-tight">Reduce inlet valve opening by 14%</div>
              <p className="mt-2 text-sm text-white/80">The mock system is showing the selected intervention, confidence band, and guardrail checks in a single decision surface.</p>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {[
          { title: "Operator preview", text: "The next operator action appears as a staged approval card with two-step validation." },
          { title: "Fallback choice", text: "A bypass flow option is held in reserve if pressure does not normalize." },
          { title: "Audit trail", text: "Every suggestion is logged with score, timestamp, and safety status." },
        ].map((item) => (
          <SectionCard key={item.title} title={item.title} subtitle="Mock decision detail" className="h-full">
            <p className="text-sm text-zinc-700 leading-relaxed font-medium">{item.text}</p>
          </SectionCard>
        ))}
      </div>
    </div>
  )
}

function SimulatorView() {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-2">
        <MetricCard icon={MonitorPlay} label="Scenario" value="B-04" detail="Pressure relief test" accent="bg-violet-500" />
        <MetricCard icon={SlidersHorizontal} label="Inputs staged" value="5" detail="Pump, valve, flow, load, delay" accent="bg-blue-500" />
        <MetricCard icon={TrendingUp} label="Predicted stability" value="84%" detail="Improves with low opening" accent="bg-emerald-500" />
        <MetricCard icon={Zap} label="Run time" value="4.2s" detail="Mock simulation speed" accent="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-2">
        <SectionCard title="Simulation console" subtitle="Visual-only control panel with staged parameters" className="xl:col-span-7">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              ["Inlet pressure", "72%", "bg-blue-500"],
              ["Bypass flow", "41%", "bg-emerald-500"],
              ["Valve response", "88%", "bg-violet-500"],
              ["Load factor", "63%", "bg-amber-500"],
            ].map(([label, value, color]) => (
              <div key={label} className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">{label}</span>
                  <span className="text-lg font-black text-zinc-900">{value}</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-zinc-200 overflow-hidden">
                  <div className={`h-full rounded-full ${color}`} style={{ width: value }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-3xl border border-dashed border-zinc-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Process animation</p>
                <p className="mt-1 text-lg font-black text-zinc-900">Pump to valve to tank</p>
              </div>
              <button className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white shadow-lg">
                <Play className="w-4 h-4 fill-current" /> Run simulation
              </button>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {simulationSteps.map((step, index) => (
                <div key={step.title} className="rounded-2xl border border-zinc-200 bg-gradient-to-b from-white to-zinc-50 p-4 shadow-sm relative overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-violet-500 to-emerald-500" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">{step.title}</span>
                    <span className="text-sm font-black text-zinc-900">{step.value}</span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-700 leading-relaxed">{step.detail}</p>
                  {index < simulationSteps.length - 1 && <ArrowRight className="absolute right-3 bottom-3 w-4 h-4 text-zinc-300" />}
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Predicted outcome" subtitle="What the visual simulator expects to happen" className="xl:col-span-5">
          <div className="space-y-4">
            {[
              { label: "Pressure peak", value: "-18%", tone: "bg-emerald-500" },
              { label: "Flow recovery", value: "+11%", tone: "bg-blue-500" },
              { label: "Risk score", value: "Low", tone: "bg-violet-500" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">{item.label}</span>
                  <Badge className={`border-0 text-white font-black uppercase ${item.tone}`}>{item.value}</Badge>
                </div>
                <div className="mt-3 h-3 rounded-full bg-zinc-200 overflow-hidden">
                  <div className={`h-full rounded-full ${item.tone}`} style={{ width: item.label === "Risk score" ? "36%" : item.label === "Pressure peak" ? "82%" : "68%" }} />
                </div>
              </div>
            ))}

            <div className="rounded-3xl bg-gradient-to-br from-violet-600 via-blue-600 to-cyan-500 p-5 text-white shadow-xl">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/80">
                <Sparkles className="w-4 h-4" /> Mock simulation engine
              </div>
              <p className="mt-2 text-xl font-black leading-tight">The scene is designed to feel like a live process replay with adjustable parameters.</p>
              <div className="mt-4 flex items-center gap-3 text-xs font-black uppercase tracking-[0.18em] text-white/80">
                <Clock3 className="w-4 h-4" /> Auto-advancing frames
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}

function RootCauseView() {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-2">
        <MetricCard icon={GitBranch} label="Root node" value="L-203" detail="Partial blockage detected" accent="bg-amber-500" />
        <MetricCard icon={Radar} label="Signals linked" value="4" detail="Confirmed causal chain" accent="bg-blue-500" />
        <MetricCard icon={TrendingUp} label="Confidence" value="92.4%" detail="Model and evidence aligned" accent="bg-emerald-500" />
        <MetricCard icon={Activity} label="Animation frames" value="08" detail="Mock causal progression" accent="bg-violet-500" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-2">
        <SectionCard title="Causal animation" subtitle="Animated chain from sensor spike to process disruption" className="xl:col-span-7">
          <div className="rounded-3xl border border-zinc-200 bg-gradient-to-br from-white to-zinc-50 p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Root cause path</p>
                <p className="mt-1 text-xl font-black text-zinc-900">Pressure spike animates through the line</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">
                <GitBranch className="w-4 h-4" /> Animated chain
              </div>
            </div>
            <div className="mt-5 grid grid-cols-4 gap-3">
              {[
                ["Sensor", "Inlet flow", "bg-blue-500"],
                ["Bottleneck", "Valve delay", "bg-violet-500"],
                ["Cause", "Blockage", "bg-amber-500"],
                ["Effect", "Pressure rise", "bg-rose-500"],
              ].map(([title, detail, color], index) => (
                <div key={title} className="relative rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm overflow-hidden">
                  <div className={`absolute inset-x-0 top-0 h-1 ${color}`} />
                  <div className={`w-10 h-10 rounded-2xl ${color} text-white flex items-center justify-center font-black shadow-lg`}>{index + 1}</div>
                  <p className="mt-3 text-sm font-black text-zinc-900 uppercase tracking-tight">{title}</p>
                  <p className="mt-1 text-sm text-zinc-600 leading-relaxed">{detail}</p>
                  {index < 3 && <ArrowRight className="absolute right-3 top-1/2 w-4 h-4 text-zinc-300" />}
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Evidence stack" subtitle="Mock signals supporting the conclusion" className="xl:col-span-5">
          <div className="space-y-3">
            {rootCauseSignals.map((signal) => (
              <div key={signal.label} className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${signal.tone}`} />
                    <span className="text-sm font-black text-zinc-900 uppercase tracking-tight">{signal.label}</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">{signal.value}</span>
                </div>
              </div>
            ))}
            <div className="rounded-3xl bg-gradient-to-r from-amber-600 to-rose-600 p-5 text-white shadow-xl">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/80">
                <Sparkles className="w-4 h-4" /> Root cause verdict
              </div>
              <p className="mt-2 text-xl font-black leading-tight">Line L-203 blockage is the primary cause of the pressure anomaly.</p>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
        <RootCauseFlow />
        <SectionCard title="Narrative" subtitle="Simple explanation of the chain for operators">
          <div className="space-y-3 text-sm text-zinc-700 leading-relaxed font-medium">
            <p>Pressure increases when inlet flow meets resistance at the line. The simulation shows the blockage as the central node, while the valve delay and pump oscillation amplify the spike.</p>
            <p>The mock layout keeps the visual focus on the relationship between upstream signals and the visible plant response, rather than on real analytics output.</p>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}

function ReplayView() {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-2">
        <MetricCard icon={RotateCcw} label="Playback window" value="24h" detail="Scrubbed to critical spike" accent="bg-slate-600" />
        <MetricCard icon={Clock3} label="Current frame" value="10:24" detail="Event peak locked" accent="bg-blue-500" />
        <MetricCard icon={Layers3} label="Snapshots" value="08" detail="Operator notes attached" accent="bg-emerald-500" />
        <MetricCard icon={MonitorPlay} label="Replay speed" value="1.0x" detail="Narrated timeline view" accent="bg-violet-500" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-2">
        <div className="xl:col-span-8 min-h-[260px]">
          <ReplayTimeline />
        </div>
        <SectionCard title="Replay notes" subtitle="Operator annotations during playback" className="xl:col-span-4">
          <div className="space-y-3">
            {[
              ["10:08 AM", "Pressure started to drift upward."],
              ["10:18 AM", "Valve response became erratic."],
              ["10:24 AM", "Critical spike triggered the alert."],
            ].map(([time, note]) => (
              <div key={time} className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 shadow-sm">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{time}</div>
                <p className="mt-2 text-sm text-zinc-700 leading-relaxed font-medium">{note}</p>
              </div>
            ))}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Playback status</div>
              <p className="mt-2 text-sm font-medium text-slate-700">The mock timeline keeps the scrubber centered on the incident window with visual playback controls below.</p>
            </div>
          </div>
        </SectionCard>
      </div>

      <AlertsTable />
    </div>
  )
}

function ReportsView() {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {reportCards.map((card) => (
          <MetricCard key={card.label} icon={card.icon} label={card.label} value={card.value} detail={card.detail} accent={card.color} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-2">
        <SectionCard title="Report digest" subtitle="Daily summary surfaces for leadership review" className="xl:col-span-5">
          <div className="space-y-4">
            {[
              ["Incident trend", "Down 11% compared with the prior 24h window"],
              ["Recovery speed", "Manual interventions cleared faster than average"],
              ["Operational notes", "The mock report bundles alerts, decisions, and replay frames"],
            ].map(([label, detail]) => (
              <div key={label} className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 shadow-sm">
                <div className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">{label}</div>
                <p className="mt-2 text-sm font-medium text-zinc-700 leading-relaxed">{detail}</p>
              </div>
            ))}
            <div className="rounded-3xl bg-gradient-to-r from-cyan-600 to-blue-600 p-5 text-white shadow-xl">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/80">
                <FileText className="w-4 h-4" /> Export ready
              </div>
              <p className="mt-2 text-xl font-black leading-tight">The report board is styled like a final sign-off packet with trends and highlight notes.</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Performance trend" subtitle="High-level operational graph for reporting" className="xl:col-span-7">
          <SystemTrendChart />
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {[
          ["Quarterly export", "PDF + CSV package staged for sharing."],
          ["Incident archive", "All events compiled into a searchable log."],
          ["Executive summary", "Condensed KPIs with visual highlights."],
        ].map(([title, detail]) => (
          <SectionCard key={title} title={title} subtitle="Report artifact">
            <p className="text-sm font-medium text-zinc-700 leading-relaxed">{detail}</p>
          </SectionCard>
        ))}
      </div>
    </div>
  )
}

function AssetsView() {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-2">
        <MetricCard icon={Database} label="Assets online" value="24" detail="2 maintenance holds" accent="bg-emerald-500" />
        <MetricCard icon={Gauge} label="Avg health" value="78%" detail="Fleet is stable" accent="bg-blue-500" />
        <MetricCard icon={HardDrive} label="Critical units" value="3" detail="Require attention" accent="bg-rose-500" />
        <MetricCard icon={TrendingUp} label="Utilization" value="64%" detail="Balanced workload" accent="bg-violet-500" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-2">
        <SectionCard title="Fleet cards" subtitle="A simple visual registry of machine health" className="xl:col-span-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {assetCards.map((asset) => (
              <div key={asset.name} className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{asset.state}</div>
                    <div className="mt-1 text-lg font-black text-zinc-900">{asset.name}</div>
                  </div>
                  <div className={`p-3 rounded-2xl ${asset.color} text-white shadow-lg`}>
                    <asset.icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 h-2 rounded-full bg-zinc-200 overflow-hidden">
                  <div className={`h-full rounded-full ${asset.color}`} style={{ width: `${asset.health}%` }} />
                </div>
                <div className="mt-3 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
                  <span>Health</span>
                  <span>{asset.health}%</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Maintenance window" subtitle="Mock tasks and service checks" className="xl:col-span-4">
          <div className="space-y-3">
            {[
              ["Pump P-101", "Calibration due in 2h"],
              ["Valve V-205", "Inspection in progress"],
              ["Tank T-101", "Healthy and cleared"],
            ].map(([name, status]) => (
              <div key={name} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                <div className="text-sm font-black text-zinc-900 uppercase tracking-tight">{name}</div>
                <p className="mt-2 text-sm font-medium text-zinc-700 leading-relaxed">{status}</p>
              </div>
            ))}
            <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-blue-600 p-5 text-white shadow-xl">
              <p className="text-xl font-black leading-tight">Fleet overview highlights what is healthy, what is watched, and what is next in line.</p>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}

function SettingsView() {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-2">
        <MetricCard icon={Settings} label="Profiles" value="3" detail="Balanced, conservative, aggressive" accent="bg-zinc-500" />
        <MetricCard icon={ShieldCheck} label="Guardrails" value="ON" detail="Safe mode is enabled" accent="bg-emerald-500" />
        <MetricCard icon={Bell} label="Routing rules" value="5" detail="Teams and channels mapped" accent="bg-blue-500" />
        <MetricCard icon={Sparkles} label="Preview mode" value="Active" detail="Changes staged before commit" accent="bg-violet-500" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-2">
        <SectionCard title="Control groups" subtitle="Visual toggles and policy presets" className="xl:col-span-7">
          <div className="space-y-3">
            {settingsGroups.map((group) => (
              <div key={group.title} className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{group.title}</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {group.items.map((item) => (
                        <span key={item} className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500 shadow-sm">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className={`w-3 h-3 rounded-full ${group.accent} shadow-sm`} />
                </div>
                <div className="mt-4 h-2 rounded-full bg-zinc-200 overflow-hidden">
                  <div className={`h-full rounded-full ${group.accent}`} style={{ width: group.title === "Alert thresholds" ? "88%" : group.title === "Notification routing" ? "64%" : "76%" }} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Environment summary" subtitle="Admin-facing mock status panel" className="xl:col-span-5">
          <div className="space-y-4">
            {[
              ["Theme", "Industrial dark accents with light canvas"],
              ["Workspace", "Front-end only preview with mock data"],
              ["Sync", "Navigation and content connected across all tabs"],
            ].map(([label, detail]) => (
              <div key={label} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                <div className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">{label}</div>
                <p className="mt-2 text-sm font-medium text-zinc-700 leading-relaxed">{detail}</p>
              </div>
            ))}
            <div className="rounded-3xl bg-gradient-to-r from-zinc-700 to-slate-900 p-5 text-white shadow-xl">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/80">
                <SlidersHorizontal className="w-4 h-4" /> Admin surface
              </div>
              <p className="mt-2 text-xl font-black leading-tight">This settings view keeps the mock system coherent without leaving the visual front-end.</p>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}

export function WorkspaceView({ tab }: { tab: TabKey }) {
  switch (tab) {
    case "overview":
      return <OverviewView />
    case "alerts":
      return <AlertsView />
    case "decisions":
      return <DecisionsView />
    case "simulator":
      return <SimulatorView />
    case "root-cause":
      return <RootCauseView />
    case "replay":
      return <ReplayView />
    case "reports":
      return <ReportsView />
    case "assets":
      return <AssetsView />
    case "settings":
      return <SettingsView />
  }
}
