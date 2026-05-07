import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ArrowRight, Waves, Zap, Thermometer, Settings } from "lucide-react"

export function ProcessOverview() {
  return (
    <Card className="border border-zinc-200 shadow-md h-full flex flex-col bg-white">
      <CardHeader className="p-5 pb-2">
        <CardTitle className="text-sm font-black text-zinc-500 uppercase tracking-widest leading-none">Process Map & Flow Control</CardTitle>
      </CardHeader>
      <CardContent className="p-10 flex-1 flex flex-col items-center justify-center bg-zinc-50/10">
        <div className="flex items-center gap-4 w-full max-w-5xl justify-between px-8">
          {/* Tank */}
          <div className="flex flex-col items-center gap-4">
             <div className="w-20 h-24 bg-zinc-100 rounded-lg border-4 border-zinc-200 relative overflow-hidden shadow-2xl">
                <div className="absolute bottom-0 w-full bg-blue-500 h-[65%] transition-all duration-1000 shadow-[inset_0_4px_10px_rgba(0,0,0,0.1)]" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <Waves className="w-8 h-8 text-white opacity-50" />
                </div>
             </div>
             <div className="text-center">
                <div className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-1.5">Tank T-101</div>
                <div className="text-lg font-black text-zinc-900 leading-none">65.2%</div>
             </div>
          </div>

          <div className="h-[4px] w-12 bg-zinc-200 flex-1 relative mx-2 rounded-full overflow-hidden">
             <div className="absolute inset-0 bg-blue-500 animate-pulse opacity-40 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
          </div>

          {/* Pump */}
          <div className="flex flex-col items-center gap-4">
             <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(225,29,72,0.3)] relative group border-8 border-white ring-2 ring-zinc-100">
                <Zap className="w-10 h-10 text-rose-500 animate-pulse" />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-rose-600 rounded-full animate-ping" />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-rose-600 rounded-full flex items-center justify-center text-[10px] text-white font-black shadow-md">!</div>
             </div>
             <div className="text-center">
                <div className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-1.5">Pump P-101</div>
                <div className="text-xl font-black text-rose-600 leading-none tracking-tighter">9.24 BAR</div>
             </div>
          </div>

          <div className="h-[4px] w-12 bg-zinc-200 flex-1 relative mx-2 rounded-full overflow-hidden">
             <div className="absolute inset-0 bg-blue-500 opacity-20" />
          </div>

          {/* Valve */}
          <div className="flex flex-col items-center gap-4">
             <div className="w-20 h-20 bg-white rounded-xl border-4 border-zinc-200 flex items-center justify-center shadow-xl">
                <Settings className="w-10 h-10 text-zinc-600" />
             </div>
             <div className="text-center">
                <div className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-1.5">Valve V-205</div>
                <div className="text-lg font-black text-zinc-900 leading-none">78% OPEN</div>
             </div>
          </div>

          <div className="h-[4px] w-12 bg-zinc-200 flex-1 relative mx-2 rounded-full overflow-hidden">
             <div className="absolute inset-0 bg-blue-500 opacity-20" />
          </div>

          {/* Heat Exchanger */}
          <div className="flex flex-col items-center gap-4">
             <div className="w-20 h-24 bg-zinc-100 rounded-lg border-4 border-zinc-200 flex flex-col shadow-2xl p-1 gap-1">
                <div className="flex-1 bg-zinc-200 rounded-sm" />
                <div className="flex-1 bg-zinc-200 rounded-sm" />
                <div className="flex-1 bg-zinc-200 rounded-sm" />
                <div className="flex-1 bg-zinc-200 rounded-sm" />
             </div>
             <div className="text-center">
                <div className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-1.5">Exchanger T-301</div>
                <div className="text-lg font-black text-zinc-900 leading-none">78.5°C</div>
             </div>
          </div>
        </div>

        <button className="mt-12 flex items-center gap-3 text-blue-600 text-xs font-black uppercase hover:gap-5 transition-all tracking-widest border-2 border-blue-50 px-6 py-2 rounded-full bg-blue-50/30">
          Full Interactive Process Map <ArrowRight className="w-5 h-5" />
        </button>
      </CardContent>
    </Card>
  )
}
