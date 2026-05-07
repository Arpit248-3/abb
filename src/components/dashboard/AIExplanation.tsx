import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BrainCircuit } from "lucide-react"

export function AIExplanation() {
  return (
    <Card className="border border-zinc-200 shadow-md flex flex-col bg-white">
      <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-3">
          <CardTitle className="text-sm font-black text-zinc-500 uppercase tracking-widest leading-none">Diagnostic Explanation</CardTitle>
          <BrainCircuit className="w-5 h-5 text-blue-600 animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0 flex-1 flex flex-col gap-8">
        <div className="space-y-4">
          <h4 className="text-xs font-black text-zinc-400 uppercase tracking-[0.15em] leading-none mb-3">Root Analysis</h4>
          <p className="text-base text-zinc-800 leading-relaxed font-medium">
            System identifies that pressure in <span className="font-black text-zinc-900 border-b-4 border-blue-200 px-1">Pump P-101</span> is critical due to backflow pressure from <span className="text-rose-600 font-black decoration-rose-200 underline underline-offset-4">partial blockage</span> in line L-203.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-black text-zinc-400 uppercase tracking-[0.15em] leading-none mb-3">Causal Factors</h4>
          <div className="flex flex-wrap gap-3">
            <Badge className="bg-rose-100 text-rose-700 border-2 border-rose-200 px-3 py-1.5 text-xs font-black uppercase shadow-sm">High Inlet Flow</Badge>
            <Badge className="bg-orange-100 text-orange-700 border-2 border-orange-200 px-3 py-1.5 text-xs font-black uppercase shadow-sm">Line L-203 Blockage</Badge>
            <Badge className="bg-blue-100 text-blue-700 border-2 border-blue-200 px-3 py-1.5 text-xs font-black uppercase shadow-sm">Valve V-205 Timing</Badge>
          </div>
        </div>

        <div className="mt-auto pt-6 border-t-2 border-zinc-50">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">Confidence Index</span>
            <span className="text-lg font-black text-zinc-900">92.4%</span>
          </div>
          <div className="w-full h-4 bg-zinc-100 rounded-full overflow-hidden shadow-inner ring-1 ring-zinc-200">
            <div className="bg-emerald-500 h-full w-[92%] shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all duration-1000" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
