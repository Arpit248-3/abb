import React from "react"
import { Doughnut } from "react-chartjs-2"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

ChartJS.register(ArcElement, Tooltip, Legend)

const data = {
  labels: ['Critical', 'High', 'Medium', 'Low'],
  datasets: [
    {
      data: [1, 2, 4, 5],
      backgroundColor: [
        '#ef4444',
        '#f97316',
        '#eab308',
        '#22c55e',
      ],
      borderWidth: 0,
      hoverOffset: 10,
      cutout: '75%',
    },
  ],
}

const options: ChartOptions<'doughnut'> = {
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: true,
      padding: 10,
      cornerRadius: 8,
    }
  },
  maintainAspectRatio: false,
}

export function AlertsChart() {
  return (
    <Card className="border border-zinc-200 shadow-md h-full flex flex-col bg-white">
      <CardHeader className="p-5 pb-2">
        <CardTitle className="text-sm font-black text-zinc-500 uppercase tracking-widest leading-none">Alert Distribution</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0 flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center relative min-h-[180px]">
          <div className="w-[180px] h-[180px]">
            <Doughnut data={data} options={options} />
          </div>
          <div className="absolute flex flex-col items-center justify-center pointer-events-none">
            <span className="text-4xl font-black text-zinc-900 leading-none">12</span>
            <span className="text-xs text-zinc-400 font-black text-center leading-tight uppercase tracking-widest mt-2">Active Alerts</span>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          {[
            { label: 'Critical', value: 1, percent: '8%', color: 'bg-rose-600' },
            { label: 'High', value: 2, percent: '17%', color: 'bg-orange-600' },
            { label: 'Medium', value: 4, percent: '33%', color: 'bg-yellow-500' },
            { label: 'Low', value: 5, percent: '42%', color: 'bg-emerald-600' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between group cursor-pointer py-2 border-b border-zinc-50 last:border-none">
              <div className="flex items-center gap-3">
                <div className={`w-3.5 h-3.5 rounded-full ${item.color} shadow-sm`} />
                <span className="text-sm font-black text-zinc-600 group-hover:text-zinc-900 transition-colors uppercase tracking-tight">{item.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-base font-black text-zinc-900">{item.value}</span>
                <span className="text-xs text-zinc-400 font-black min-w-[35px] text-right uppercase">({item.percent})</span>
              </div>
            </div>
          ))}
        </div>

        <button className="mt-auto pt-6 flex items-center gap-2 text-blue-600 text-xs font-black uppercase hover:gap-4 transition-all tracking-widest border-t border-zinc-100">
          Advanced Alert Management <ArrowRight className="w-4 h-4" />
        </button>
      </CardContent>
    </Card>
  )
}
