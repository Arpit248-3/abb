import { 
  Bell, 
  Menu, 
  Settings,
  AlertTriangle
} from "lucide-react"
import type { TabMeta } from "@/lib/dashboard-navigation"

interface HeaderProps {
  meta: TabMeta
}

export function Header({ meta }: HeaderProps) {
  return (
    <header className="h-14 bg-white border-b border-zinc-200 flex items-center justify-between px-4 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-4 flex-1">
        <button className="text-zinc-500 hover:text-zinc-900 transition-colors">
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="flex-1 max-w-2xl">
          <div className={`rounded-md py-2 px-4 flex items-center justify-between shadow-lg ring-1 ${meta.bannerClass}`}>
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-white animate-pulse" />
              <div className="flex flex-col">
                <span className="text-sm font-black text-white leading-none uppercase tracking-tight">{meta.bannerTitle}</span>
                <span className="text-[10px] font-black text-white/80 uppercase tracking-[0.18em] mt-1">{meta.bannerSubtitle}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="bg-white/20 text-white px-2 py-0.5 rounded text-xs font-black uppercase shadow-inner">{meta.bannerTag}</span>
              <span className="text-xs font-black text-white/90">{meta.bannerTime}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 ml-6">
        <div className={`flex items-center gap-3 px-4 py-2 rounded-md border shadow-sm ${meta.statusClass}`}>
          <div className="w-2.5 h-2.5 bg-current rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          <div className="flex flex-col">
            <span className="text-sm font-black uppercase tracking-tight leading-none">{meta.statusLabel}</span>
            <span className="text-[10px] font-black uppercase tracking-[0.18em] mt-1 opacity-70">{meta.statusDetail}</span>
          </div>
        </div>

        <div className="h-8 w-[1px] bg-zinc-200" />

        <div className="flex items-center gap-3">
          <button className="p-2 text-zinc-500 hover:text-zinc-900 transition-colors relative">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-rose-600 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-black shadow-md">
              {meta.notificationCount}
            </span>
          </button>
          <button className="p-2 text-zinc-500 hover:text-zinc-900 transition-colors">
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  )
}
