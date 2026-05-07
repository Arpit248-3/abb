import { cn } from "@/lib/utils"
import { LogOut, User, Circle } from "lucide-react"
import type { TabKey } from "@/lib/dashboard-navigation"
import { navigationItems } from "@/lib/dashboard-navigation"

interface SidebarProps {
  activeTab: TabKey
  onTabChange: (tab: TabKey) => void
  onLogout: () => void
  isLoggingOut: boolean
}

export function Sidebar({ activeTab, onTabChange, onLogout, isLoggingOut }: SidebarProps) {
  return (
    <aside className="w-64 bg-[#0a0a0b] text-zinc-400 flex flex-col h-screen border-r border-zinc-800 shadow-2xl z-20">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="text-white font-black text-2xl tracking-tighter flex items-center gap-2 uppercase">
            DecisionOS <span className="text-blue-500 italic">X</span>
          </div>
        </div>
        <div className="text-xs text-zinc-500 uppercase font-black tracking-[0.2em] mb-6 opacity-80">
          Intelligent Interface
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1.5">
        {navigationItems.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => onTabChange(item.tab)}
            className={cn(
              "w-full flex items-center justify-between px-4 py-3 rounded-md transition-all duration-200 group",
              activeTab === item.tab 
                ? "bg-blue-600 text-white shadow-xl shadow-blue-600/30" 
                : "hover:bg-white/10 hover:text-white"
            )}
          >
            <div className="flex items-center gap-4">
              <item.icon className={cn("w-5 h-5", activeTab === item.tab ? "text-white" : "text-zinc-500 group-hover:text-zinc-300")} />
              <span className={cn("text-sm font-black uppercase tracking-tight", activeTab === item.tab ? "text-white" : "text-zinc-400 group-hover:text-white")}>
                {item.label}
              </span>
            </div>
            {item.badge && (
              <span className="bg-rose-600 text-white text-xs px-2 py-0.5 rounded-full min-w-[1.4rem] text-center font-black shadow-lg">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto space-y-4">
        <div className="bg-zinc-900/80 rounded-lg p-4 border border-zinc-800/50 text-xs space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-zinc-500 font-black uppercase tracking-tighter">Status</span>
            <span className="text-emerald-500 flex items-center gap-2 font-black uppercase">
              <Circle className="w-2.5 h-2.5 fill-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" /> Online
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-500 font-black uppercase tracking-tighter">Uptime</span>
            <span className="text-zinc-100 font-black uppercase">7d 14h</span>
          </div>
          <div className="flex justify-between items-center border-t border-zinc-800/50 pt-3">
            <span className="text-zinc-500 font-black uppercase tracking-tighter">Active Alerts</span>
            <span className="text-rose-500 font-black text-sm">12</span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800/30 hover:border-zinc-700 transition-colors cursor-pointer group">
        <div className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-zinc-700 overflow-hidden flex items-center justify-center group-hover:border-blue-500 transition-all shadow-lg">
          <User className="w-6 h-6 text-zinc-500" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-black text-white leading-none">Operator Admin</span>
          <span className="text-[10px] font-black text-zinc-500 leading-none uppercase tracking-tighter mt-1">Plant Floor 1</span>
        </div>
                  <button onClick={onLogout} disabled={isLoggingOut} className="ml-auto text-zinc-400 hover:text-white transition-colors flex items-center">
            {isLoggingOut ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <LogOut className="w-5 h-5" />
            )}
          </button>
      </div>

        <div className="pt-2 flex flex-col gap-1 items-center opacity-90">
          <div className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">Global Operations</div>
          <div className="flex items-center gap-1 grayscale brightness-200 contrast-150">
             <span className="text-white font-black text-2xl tracking-tighter">ABB</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
