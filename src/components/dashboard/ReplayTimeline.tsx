import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  SkipBack as Rewind, 
  SkipForward as FastForward, 
  Calendar,
  ChevronDown,
  Clock
} from "lucide-react"

export function ReplayTimeline() {
  return (
    <Card className="border border-zinc-200 shadow-md bg-white overflow-hidden">
      <CardHeader className="p-5 pb-2 border-b border-zinc-50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-black text-zinc-500 uppercase tracking-widest leading-none">Event Replay Timeline</CardTitle>
          <div className="flex items-center gap-3">
             <Calendar className="w-5 h-5 text-zinc-400" />
             <ChevronDown className="w-4 h-4 text-zinc-400" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <button className="p-3 bg-zinc-900 text-white rounded-full hover:bg-blue-600 transition-all shadow-lg active:scale-95">
              <Play className="w-5 h-5 fill-current" />
            </button>
            <div className="flex-1 space-y-3">
              <div className="h-4 w-full bg-zinc-100 rounded-full relative overflow-hidden ring-1 ring-zinc-200 shadow-inner">
                <div className="absolute top-0 left-0 h-full w-[45%] bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                <div className="absolute top-0 left-[45%] h-full w-4 bg-white border-2 border-blue-500 rounded-full shadow-md z-10 -ml-2 cursor-pointer hover:scale-110 transition-transform" />
              </div>
              <div className="flex justify-between text-xs font-black text-zinc-400 uppercase tracking-widest">
                <span>08:00 AM</span>
                <span className="text-blue-600 font-black">10:24 AM (Current)</span>
                <span>08:00 PM</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-8 border-t border-zinc-50 pt-6">
             {[
               { icon: Rewind, label: '-10s' },
               { icon: FastForward, label: '+10s' },
               { icon: Clock, label: 'Realtime' }
             ].map((tool) => (
               <button key={tool.label} className="flex flex-col items-center gap-2 group">
                  <div className="p-3 rounded-xl bg-zinc-50 text-zinc-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all border border-zinc-100 group-hover:border-blue-200 shadow-sm">
                    <tool.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-blue-600">{tool.label}</span>
               </button>
             ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
