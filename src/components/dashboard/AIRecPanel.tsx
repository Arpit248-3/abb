
import { 
  ArrowRight
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const recommendations = [
  {
    title: "Reduce Inlet Valve Opening",
    confidence: "92%",
    impact: "High",
    effort: "Low",
    eta: "2 min",
    active: true
  },
  {
    title: "Increase Bypass Flow",
    confidence: "68%",
    impact: "Medium",
    effort: "Low",
    eta: "5 min",
  },
  {
    title: "Start Auxiliary Pump P-202",
    confidence: "54%",
    impact: "High",
    effort: "Medium",
    eta: "10 min",
  }
]

export function AIRecPanel() {
  return (
    <Card className="border border-zinc-200 shadow-md flex flex-col bg-white">
      <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-3">
          <CardTitle className="text-sm font-black text-zinc-500 uppercase tracking-widest leading-none">Smart Recommendations</CardTitle>
          <Badge className="bg-blue-600 text-white border-none text-[10px] px-2 h-5 font-black shadow-md ring-2 ring-blue-100">AI ENGINE</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-0 flex-1 flex flex-col gap-4">
        {recommendations.map((rec) => (
          <div 
            key={rec.title} 
            className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
              rec.active 
                ? "bg-emerald-50/80 border-emerald-500 shadow-lg ring-4 ring-emerald-100/50 scale-[1.02]" 
                : "bg-zinc-50/50 border-zinc-200 hover:border-zinc-400 hover:bg-zinc-100"
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex flex-col gap-1">
                {rec.active && <span className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.1em] leading-none mb-1">Targeted Optimization</span>}
                <h4 className={`text-base font-black ${rec.active ? "text-zinc-900" : "text-zinc-700"}`}>{rec.title}</h4>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-zinc-400 font-black uppercase tracking-tighter">Confidence</span>
                <span className={`text-base font-black ${rec.active ? "text-emerald-700" : "text-zinc-900"}`}>{rec.confidence}</span>
              </div>
            </div>

            {rec.active && (
              <div className="w-full bg-emerald-200/50 h-2.5 rounded-full mb-4 overflow-hidden shadow-inner">
                <div className="bg-emerald-600 h-full w-[92%] shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
              </div>
            )}

            <div className="flex items-center justify-between mt-2">
               <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-400 uppercase font-black">Impact</span>
                    <span className={`text-sm font-black ${rec.impact === 'High' ? 'text-rose-600' : 'text-orange-600'}`}>{rec.impact}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-400 uppercase font-black">Effort</span>
                    <span className="text-sm font-black text-emerald-700">{rec.effort}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-400 uppercase font-black">Estimated ETA</span>
                    <span className="text-sm font-black text-zinc-900">{rec.eta}</span>
                  </div>
               </div>
            </div>
          </div>
        ))}

        <button className="mt-auto pt-6 flex items-center gap-3 text-blue-600 text-xs font-black uppercase hover:gap-5 transition-all tracking-widest border-t border-zinc-100">
          Simulate Alternative Paths <ArrowRight className="w-4 h-4" />
        </button>
      </CardContent>
    </Card>
  )
}
