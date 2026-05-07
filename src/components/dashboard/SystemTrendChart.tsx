import React from "react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions
} from 'chart.js'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ArrowRight, Zap } from "lucide-react"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const labels = ['10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM', '8:00 PM', '10:00 PM', '12:00 AM', '2:00 AM', '4:00 AM', '6:00 AM', '8:00 AM', '10:00 AM']

const data = {
  labels,
  datasets: [
    {
      label: 'Pressure (bar)',
      data: [45, 48, 52, 49, 55, 58, 50, 48, 52, 60, 95, 65, 60],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.05)',
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 6,
    },
    {
      label: 'Temperature (°C)',
      data: [35, 36, 38, 37, 40, 42, 39, 38, 40, 45, 50, 42, 40],
      borderColor: '#f97316',
      backgroundColor: 'rgba(249, 115, 22, 0.05)',
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 6,
    },
    {
      label: 'Flow (m³/h)',
      data: [25, 24, 26, 25, 28, 30, 27, 26, 28, 32, 25, 28, 27],
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34, 197, 94, 0.05)',
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 6,
    },
  ],
}

const options: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      padding: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      titleColor: '#09090b',
      bodyColor: '#52525b',
      borderColor: '#e4e4e7',
      borderWidth: 1,
      cornerRadius: 12,
      boxPadding: 6,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          size: 10,
        },
        color: '#a1a1aa',
        maxRotation: 0,
        autoSkip: true,
        maxTicksLimit: 6,
      },
      border: {
        display: false,
      }
    },
    y: {
      min: 0,
      max: 100,
      grid: {
        color: '#f4f4f5',
      },
      ticks: {
        font: {
          size: 10,
        },
        color: '#a1a1aa',
        stepSize: 25,
      },
      border: {
        display: false,
      }
    },
  },
}

export function SystemTrendChart() {
  return (
    <Card className="border border-zinc-200 shadow-md h-full flex flex-col bg-white">
      <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-sm font-black text-zinc-500 uppercase tracking-widest leading-none">Live System Trends</CardTitle>
          <p className="text-xs text-zinc-400 font-black mt-1.5 uppercase tracking-tighter leading-none">Real-time Telemetry (24h Window)</p>
        </div>
        <div className="flex gap-6">
          {[
            { label: 'Pressure', color: 'bg-blue-600' },
            { label: 'Temp', color: 'bg-orange-600' },
            { label: 'Flow', color: 'bg-emerald-600' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${item.color} shadow-sm`} />
              <span className="text-xs font-black text-zinc-500 uppercase tracking-tight">{item.label}</span>
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0 flex-1 flex flex-col">
        <div className="flex-1 min-h-[220px] relative mt-4">
          <Line data={data} options={options} />
          
          <div className="absolute top-[40px] right-[15%] border-r-4 border-rose-500/20 border-dashed h-[60%] z-0 pointer-events-none" />
          <div className="absolute top-[20px] right-[8%] bg-rose-600 text-white text-[10px] px-3 py-1.5 rounded shadow-lg z-10 font-black flex flex-col items-center uppercase tracking-widest ring-2 ring-white">
             <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Spike Detected</span>
             <span className="opacity-80 text-[8px] mt-0.5">10:24 AM (Critical)</span>
          </div>
        </div>
        
        <button className="mt-4 flex items-center gap-2 text-blue-600 text-xs font-black uppercase hover:gap-4 transition-all tracking-widest border-t border-zinc-100 pt-4">
          Historical Trend Analysis <ArrowRight className="w-4 h-4" />
        </button>
      </CardContent>
    </Card>
  )
}
