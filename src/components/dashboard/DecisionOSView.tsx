import React, { useState, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, LineChart, Line, ComposedChart
} from 'recharts';
import { 
  AlertTriangle, Activity, Clock, Zap, TrendingDown, PowerOff, ChevronDown, ChevronUp, Play, Pause, Thermometer, ShieldAlert, SkipBack, SkipForward
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- MOCK DATA ---
const historicalData = [
  { time: -10, label: 'T-10m', temp: 70 },
  { time: -8, label: 'T-8m', temp: 72 },
  { time: -5, label: 'T-5m', temp: 75 },
  { time: -2, label: 'T-2m', temp: 82 },
  { time: 0, label: 'T-0', temp: 92 },
];

const chartDataOptions = {
  default: [
    { time: 1, label: 'T+1m', temp: 95 },
    { time: 5, label: 'T+5m', temp: 110 },
    { time: 10, label: 'T+10m', temp: 122 },
    { time: 15, label: 'T+15m', temp: 130 },
  ],
  reduceLoad: [
    { time: 1, label: 'T+1m', temp: 90 },
    { time: 5, label: 'T+5m', temp: 80 },
    { time: 10, label: 'T+10m', temp: 75 },
    { time: 15, label: 'T+15m', temp: 72 },
  ],
  triggerPump: [
    { time: 1, label: 'T+1m', temp: 94 },
    { time: 5, label: 'T+5m', temp: 105 },
    { time: 10, label: 'T+10m', temp: 112 },
    { time: 15, label: 'T+15m', temp: 120 },
  ],
  emergencyShutdown: [
    { time: 1, label: 'T+1m', temp: 85 },
    { time: 5, label: 'T+5m', temp: 60 },
    { time: 10, label: 'T+10m', temp: 45 },
    { time: 15, label: 'T+15m', temp: 30 },
  ]
};

const cascadingAlerts = [
  { id: 1, time: "10:24:02", sensor: "VIB-204", issue: "Rotor Vibration High", status: "Suppressed AI" },
  { id: 2, time: "10:24:05", sensor: "VOLT-89", issue: "Phase 2 Voltage Drop", status: "Suppressed AI" },
  { id: 3, time: "10:24:12", sensor: "TMP-12", issue: "Bearing Temp Warning", status: "Suppressed AI" },
  { id: 4, time: "10:24:18", sensor: "PRS-44", issue: "Coolant Pressure Low", status: "Suppressed AI" },
];

type ScenarioKey = 'default' | 'reduceLoad' | 'triggerPump' | 'emergencyShutdown';

export function DecisionOSView() {
  const [activeScenario, setActiveScenario] = useState<ScenarioKey>('default');
  const [timelineValue, setTimelineValue] = useState<number>(0);
  const [alertsExpanded, setAlertsExpanded] = useState(false);

  // Generate chart data based on active scenario and timeline scrubber
  const fullChartData = useMemo(() => {
    const futureData = chartDataOptions[activeScenario];
    
    // Create base data array combining past and future points
    const combined = [
      ...historicalData.map(d => ({
        time: d.time,
        label: d.label,
        pastTemp: d.temp,
        futureTemp: d.time === 0 ? d.temp : null // Connect at T-0
      })),
      ...futureData.map(d => ({
        time: d.time,
        label: d.label,
        pastTemp: null,
        futureTemp: d.temp
      }))
    ];

    return combined;
  }, [activeScenario]);

  // Determine Replay or Future Mode from scrubber
  const isReplayMode = timelineValue < 0;
  const isFutureMode = timelineValue > 0;

  return (
    <div className="flex flex-col gap-4 p-4 text-zinc-900 min-h-screen font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 flex items-center gap-2">
            <Activity className="text-blue-600 w-6 h-6" />
            DecisionOS <span className="text-zinc-400 font-medium">| What-If Intelligence</span>
          </h1>
          <p className="text-sm text-zinc-500 mt-1 uppercase tracking-widest font-bold text-[10px]">
            Active Monitoring & Simulation Environment
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white shadow-sm rounded-full border border-zinc-200">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Live Telemetry</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        
        {/* LEFT COLUMN: Chart & Timeline */}
        <div className="xl:col-span-8 flex flex-col gap-4">
          
          {/* THE SMART ROOT-CAUSE ALERT PANEL */}
          <div className="rounded-xl border border-rose-200 bg-white overflow-hidden shadow-md">
            <button 
              onClick={() => setAlertsExpanded(!alertsExpanded)}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-rose-50 to-white hover:bg-rose-50/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="bg-rose-500 text-white p-2 rounded-lg animate-pulse shadow-sm">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-rose-600 font-black text-sm uppercase tracking-widest">Singular Root-Cause Identified</div>
                  <h2 className="text-zinc-900 font-bold text-lg leading-tight mt-0.5">
                    🚨 CRITICAL: Generator 1 Core Overheating due to Coolant Leak
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-3 text-rose-700">
                <span className="text-xs font-bold bg-white px-3 py-1 rounded-full border border-rose-200 shadow-sm">
                  View 14 Linked Cascading Alerts
                </span>
                {alertsExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </button>
            
            {alertsExpanded && (
              <div className="p-4 border-t border-rose-100 bg-zinc-50/50">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-3 ml-2">Intelligent Alert Suppression Active</div>
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-white border-y border-zinc-200 text-zinc-500">
                    <tr>
                      <th className="px-4 py-3 font-black tracking-wider">Time</th>
                      <th className="px-4 py-3 font-black tracking-wider">Sensor ID</th>
                      <th className="px-4 py-3 font-black tracking-wider">Symptom / Alert</th>
                      <th className="px-4 py-3 font-black tracking-wider text-right">AI Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-zinc-700">
                    {cascadingAlerts.map((alert) => (
                      <tr key={alert.id} className="border-b border-zinc-100 hover:bg-zinc-100/50 transition-colors">
                        <td className="px-4 py-2.5 font-mono text-zinc-500">{alert.time}</td>
                        <td className="px-4 py-2.5 font-medium text-zinc-900">{alert.sensor}</td>
                        <td className="px-4 py-2.5">{alert.issue}</td>
                        <td className="px-4 py-2.5 text-right">
                          <span className="bg-zinc-200 text-zinc-600 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded">
                            {alert.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-center text-xs text-zinc-400 italic">
                        + 10 more derivative alerts suppressed
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* THE DUAL-ZONE INTERACTIVE CHART */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-md relative overflow-hidden">
            {isReplayMode && (
              <div className="absolute inset-0 z-10 bg-white/40 backdrop-blur-[1px] pointer-events-none flex items-start justify-center pt-8">
                <div className="bg-blue-600 border border-blue-500 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-500/30">
                  <Clock className="w-4 h-4" /> Replay Mode Active (T{timelineValue}m)
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-zinc-900 font-bold text-lg flex items-center gap-2">
                  <Thermometer className="w-5 h-5 text-amber-500" />
                  Core Temperature Projection
                </h3>
                <div className="flex gap-4 mt-1">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                    <div className="w-3 h-0.5 bg-blue-500"></div> Historical Data
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                    <div className="w-3 h-0.5 border-t-2 border-dashed border-purple-500"></div> Simulated Future
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-widest font-black text-zinc-400">Target Parameter</div>
                <div className="text-2xl font-black text-zinc-900 font-mono">
                  {fullChartData.find(d => d.time === timelineValue)?.pastTemp || fullChartData.find(d => d.time === timelineValue)?.futureTemp || '--'}°C
                </div>
              </div>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={fullChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                  <XAxis 
                    dataKey="label" 
                    stroke="#a1a1aa" 
                    tick={{ fill: '#71717a', fontSize: 12, fontWeight: 600 }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#a1a1aa" 
                    tick={{ fill: '#71717a', fontSize: 12, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    domain={['dataMin - 10', 'dataMax + 10']}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e4e4e7', borderRadius: '8px', color: '#18181b', fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#3f3f46' }}
                  />
                  
                  {/* Vertical Reference Line for T-0 */}
                  <ReferenceLine 
                    x="T-0" 
                    stroke="#e11d48" 
                    strokeDasharray="3 3" 
                    label={{ position: 'top', value: 'Present Moment (T-0)', fill: '#e11d48', fontSize: 11, fontWeight: 'bold' }} 
                  />
                  
                  {/* Current Time Indicator based on scrubber */}
                  {timelineValue !== 0 && (
                    <ReferenceLine 
                      x={timelineValue > 0 ? `T+${timelineValue}m` : `T${timelineValue}m`} 
                      stroke="#2563eb" 
                      label={{ position: 'bottom', value: 'Scrubber', fill: '#2563eb', fontSize: 10, fontWeight: 'bold' }} 
                    />
                  )}

                  {/* Past Data Area/Line */}
                  <Area type="monotone" dataKey="pastTemp" stroke="#3b82f6" strokeWidth={3} fillOpacity={0.2} fill="url(#colorPast)" isAnimationActive={false} />
                  
                  {/* Future Simulated Data Area/Line */}
                  <Area type="monotone" dataKey="futureTemp" stroke="#a855f7" strokeWidth={3} strokeDasharray="6 6" fillOpacity={0.1} fill="url(#colorFuture)" animationDuration={500} />
                  
                  <defs>
                    <linearGradient id="colorPast" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorFuture" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* THE TIMELINE CONTROLLER SCRUB-SLIDER */}
            <div className="mt-6 px-4 pb-2">
              <div className="flex justify-between text-[10px] font-black tracking-widest text-zinc-400 uppercase mb-2">
                <span>-10m History</span>
                <span className={timelineValue === 0 ? "text-emerald-600" : ""}>Now (T-0)</span>
                <span>+15m Simulated</span>
              </div>
              <input 
                type="range" 
                min="-10" 
                max="15" 
                step="1" 
                value={timelineValue}
                onChange={(e) => setTimelineValue(parseInt(e.target.value))}
                className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <div className="flex justify-center gap-4 mt-4">
                <button 
                  onClick={() => setTimelineValue(Math.max(-10, timelineValue - 1))}
                  className="p-2 bg-zinc-100 hover:bg-zinc-200 rounded-full text-zinc-500 hover:text-zinc-900 transition-colors"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setTimelineValue(0)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 rounded-full text-xs font-bold uppercase tracking-widest text-zinc-700 hover:text-zinc-900 transition-colors flex items-center gap-2"
                >
                  {timelineValue === 0 ? <Pause className="w-4 h-4 text-emerald-600" /> : <Play className="w-4 h-4" />}
                  {timelineValue === 0 ? 'Live' : 'Reset to Live'}
                </button>
                <button 
                  onClick={() => setTimelineValue(Math.min(15, timelineValue + 1))}
                  className="p-2 bg-zinc-100 hover:bg-zinc-200 rounded-full text-zinc-500 hover:text-zinc-900 transition-colors"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: What-If Simulation Matrix */}
        <div className="xl:col-span-4 flex flex-col h-full">
          <div className="rounded-xl border border-zinc-200 bg-white flex flex-col h-full overflow-hidden shadow-md">
            <div className="p-5 border-b border-zinc-200 bg-zinc-50/80">
              <h3 className="text-zinc-900 font-bold text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" />
                What-If Simulation Matrix
              </h3>
              <p className="text-xs text-zinc-500 mt-1 font-medium">
                Select an intervention to preview its systemic impact over the next 15 minutes.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-zinc-50/50">
              
              <ScenarioCard 
                active={activeScenario === 'reduceLoad'}
                onClick={() => { setActiveScenario('reduceLoad'); setTimelineValue(5); }}
                title="Option A: Reduce Load by 30%"
                icon={<TrendingDown className="w-5 h-5" />}
                metrics={{ time: "5m", risk: "Low", riskColor: "text-emerald-700 bg-emerald-50 border-emerald-200", cost: "-2.4%" }}
              />

              <ScenarioCard 
                active={activeScenario === 'triggerPump'}
                onClick={() => { setActiveScenario('triggerPump'); setTimelineValue(5); }}
                title="Option B: Trigger Aux Coolant Pump"
                icon={<Activity className="w-5 h-5" />}
                metrics={{ time: "12m", risk: "High", riskColor: "text-orange-700 bg-orange-50 border-orange-200", cost: "-0.8%" }}
              />

              <ScenarioCard 
                active={activeScenario === 'emergencyShutdown'}
                onClick={() => { setActiveScenario('emergencyShutdown'); setTimelineValue(5); }}
                title="Option C: Emergency Shutdown"
                icon={<PowerOff className="w-5 h-5" />}
                metrics={{ time: "2m", risk: "Critical", riskColor: "text-rose-700 bg-rose-50 border-rose-200", cost: "-45.0%" }}
              />

              <div className="mt-auto pt-4">
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600 mb-1">AI Recommendation</div>
                  <p className="text-sm font-medium text-zinc-700">
                    <strong className="text-zinc-900">Option A</strong> provides the optimal balance of asset safety and production continuity.
                  </p>
                  <button className="mt-3 w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-colors shadow-md shadow-purple-600/20">
                    Execute Option A
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Helper Component for Scenario Cards
function ScenarioCard({ 
  active, 
  onClick, 
  title, 
  icon, 
  metrics 
}: { 
  active: boolean, 
  onClick: () => void, 
  title: string, 
  icon: React.ReactNode, 
  metrics: { time: string, risk: string, riskColor: string, cost: string } 
}) {
  return (
    <div 
      onClick={onClick}
      onMouseEnter={onClick}
      className={cn(
        "cursor-pointer rounded-xl border p-4 transition-all duration-300 relative overflow-hidden bg-white",
        active 
          ? "border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)] ring-1 ring-purple-100" 
          : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
      )}
    >
      {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />}
      
      <div className="flex items-start gap-3">
        <div className={cn("p-2 rounded-lg", active ? "bg-purple-100 text-purple-600" : "bg-zinc-100 text-zinc-500")}>
          {icon}
        </div>
        <div className="flex-1">
          <h4 className={cn("font-bold text-sm", active ? "text-zinc-900" : "text-zinc-700")}>{title}</h4>
          
          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold">Stabilize</span>
              <span className="text-xs font-bold text-zinc-700 mt-0.5">{metrics.time}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold">Risk Level</span>
              <span className={cn("text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border w-fit mt-0.5", metrics.riskColor)}>
                {metrics.risk}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold">Impact</span>
              <span className="text-xs font-bold text-zinc-700 mt-0.5">{metrics.cost}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
