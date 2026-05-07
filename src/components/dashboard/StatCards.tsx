import React from "react"
import { 
  AlertTriangle, 
  Flame, 
  Activity, 
  Clock, 
  Zap,
  ArrowDown,
  ArrowUp
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const stats = [
  {
    label: "Active Alerts",
    value: "3",
    change: "40%",
    trend: "down",
    icon: AlertTriangle,
    color: "emerald",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500"
  },
  {
    label: "Critical Alerts",
    value: "1",
    change: "50%",
    trend: "up",
    icon: Flame,
    color: "red",
    iconBg: "bg-red-50",
    iconColor: "text-red-500"
  },
  {
    label: "System Health",
    value: "92%",
    change: "5%",
    trend: "up",
    icon: Activity,
    color: "emerald",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500"
  },
  {
    label: "MTTR (24h)",
    value: "18.4 min",
    change: "12%",
    trend: "down",
    icon: Clock,
    color: "blue",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500"
  },
  {
    label: "Actions Taken",
    value: "8",
    change: "14%",
    trend: "up",
    icon: Zap,
    color: "purple",
    iconBg: "bg-purple-50",
    iconColor: "text-purple-500"
  }
]

export function StatCards() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
      {stats.map((stat) => (
        <Card key={stat.label} className="border border-zinc-200 shadow-md overflow-hidden group bg-white hover:border-blue-300 transition-all">
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-sm font-black text-zinc-500 uppercase tracking-wider leading-none">{stat.label}</span>
                <span className="text-3xl font-black text-zinc-900 mt-2 leading-none">{stat.value}</span>
              </div>
              <div className={cn("p-3 rounded-lg transition-all group-hover:scale-110 duration-300 shadow-sm", stat.iconBg, stat.iconColor)}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              <div className={cn(
                "flex items-center gap-1 text-xs font-black px-2 py-1 rounded shadow-sm",
                stat.trend === 'up' ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50"
              )}>
                {stat.trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {stat.change}
              </div>
              <span className="text-[10px] text-zinc-400 font-black tracking-widest uppercase">vs 24h Period</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
