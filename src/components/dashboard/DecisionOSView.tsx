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
  { time: -10, label: 'T-10m', temp: 70, pressure: 50 },
  { time: -8, label: 'T-8m', temp: 72, pressure: 52 },
  { time: -5, label: 'T-5m', temp: 75, pressure: 55 },
  { time: -2, label: 'T-2m', temp: 82, pressure: 65 },
  { time: 0, label: 'T-0', temp: 92, pressure: 80 },
];

const DECISION_OS_SCENARIOS = {
  default: {
    label: "Unmitigated Fault State",
    globalHealth: 42,
    efficiency: "Degraded (54%)",
    downstreamStatus: "CRITICAL SYSTEM RISK",
    healthColor: "text-rose-600",
    dependencies: [
      { id: "grid-s4", name: "Sector 4 Sub-Station Grid", status: "CRITICAL DROP", message: "Voltage Collapse imminent in 2m", color: "red", pulse: true },
      { id: "line-a2", name: "Assembly Conveyor Systems", status: "DEGRADED", message: "Motor Sync Failure / Pile-up Risk", color: "amber", pulse: false },
      { id: "cool-t3", name: "Chemical Cooling Pump 3", status: "WARNING", message: "Backpressure building rapidly", color: "amber", pulse: false }
    ],
    futureChartData: [
      { time: 'T+1m', temp: 96, pressure: 82 },
      { time: 'T+5m', temp: 112, pressure: 95 },
      { time: 'T+15m', temp: 138, pressure: 118 }
    ]
  },
  reduceLoad: {
    label: "Load Mitigation Scheme (Active)",
    globalHealth: 94,
    efficiency: "Regulated (88%)",
    downstreamStatus: "STABILIZED",
    healthColor: "text-emerald-600",
    dependencies: [
      { id: "grid-s4", name: "Sector 4 Sub-Station Grid", status: "BALANCED", message: "Load shedding initiated via smart dimming", color: "green", pulse: false },
      { id: "line-a2", name: "Assembly Conveyor Systems", status: "ADAPTED", message: "Throughput throttled smoothly to 80%", color: "green", pulse: false },
      { id: "cool-t3", name: "Chemical Cooling Pump 3", status: "NORMAL", message: "Thermal thresholds safely stabilized", color: "green", pulse: false }
    ],
    futureChartData: [
      { time: 'T+1m', temp: 90, pressure: 75 },
      { time: 'T+5m', temp: 81, pressure: 68 },
      { time: 'T+15m', temp: 73, pressure: 60 }
    ]
  },
  triggerPump: {
    label: "Aux Pump Bypass Scheme (Active)",
    globalHealth: 68,
    efficiency: "Restricted (71%)",
    downstreamStatus: "PARTIAL RECOVERY",
    healthColor: "text-amber-600",
    dependencies: [
      { id: "grid-s4", name: "Sector 4 Sub-Station Grid", status: "RISK MITIGATED", message: "Drawing power via alternate ring bus", color: "green", pulse: false },
      { id: "line-a2", name: "Assembly Conveyor Systems", status: "CRITICAL TRIP", message: "Main feeder line interrupted", color: "red", pulse: true },
      { id: "cool-t3", name: "Chemical Cooling Pump 3", status: "STABLE", message: "Secondary auxiliary coolant active", color: "green", pulse: false }
    ],
    futureChartData: [
      { time: 'T+1m', temp: 93, pressure: 71 },
      { time: 'T+5m', temp: 102, pressure: 69 },
      { time: 'T+15m', temp: 116, pressure: 68 }
    ]
  },
  shutdown: {
    label: "Emergency Trip Scheme (Executed)",
    globalHealth: 15,
    efficiency: "OFFLINE (0%)",
    downstreamStatus: "CONTROLLED ISOLATION",
    healthColor: "text-rose-700",
    dependencies: [
      { id: "grid-s4", name: "Sector 4 Sub-Station Grid", status: "ISOLATED", message: "Breakers cleanly tripped open", color: "red", pulse: false },
      { id: "line-a2", name: "Assembly Conveyor Systems", status: "SHUTDOWN", message: "Emergency E-Stop sequence complete", color: "red", pulse: false },
      { id: "cool-t3", name: "Chemical Cooling Pump 3", status: "SAFE STATE", message: "Fluids safely vented to reservoir", color: "green", pulse: false }
    ],
    futureChartData: [
      { time: 'T+1m', temp: 50, pressure: 20 },
      { time: 'T+5m', temp: 35, pressure: 5 },
      { time: 'T+15m', temp: 25, pressure: 0 }
    ]
  }
};

const cascadingAlerts = [
  { id: 1, time: "10:24:02", sensor: "VIB-204", issue: "Rotor Vibration High", status: "Suppressed AI" },
  { id: 2, time: "10:24:05", sensor: "VOLT-89", issue: "Phase 2 Voltage Drop", status: "Suppressed AI" },
  { id: 3, time: "10:24:12", sensor: "TMP-12", issue: "Bearing Temp Warning", status: "Suppressed AI" },
  { id: 4, time: "10:24:18", sensor: "PRS-44", issue: "Coolant Pressure Low", status: "Suppressed AI" },
];

type ScenarioKey = 'default' | 'reduceLoad' | 'triggerPump' | 'shutdown';

export function DecisionOSView() {
  const [activeScenario, setActiveScenario] = useState<ScenarioKey>('default');
  const [timelineValue, setTimelineValue] = useState<number>(0);
  const [alertsExpanded, setAlertsExpanded] = useState(false);

  // Generate chart data based on active scenario and timeline scrubber
  const fullChartData = useMemo(() => {
    const futureData = DECISION_OS_SCENARIOS[activeScenario]?.futureChartData || [];
    
    // Create base data array combining past and future points
    const combined = [
      ...historicalData.map(d => ({
        time: d.time,
        label: d.label,
        pastTemp: d.temp,
        pastPressure: d.pressure,
        futureTemp: d.time === 0 ? d.temp : null, // Connect at T-0
        futurePressure: d.time === 0 ? d.pressure : null
      })),
      ...futureData.map(d => {
        const tNum = parseInt(d.time.replace(/\D/g, '')) || 0;
        return {
          time: tNum,
          label: d.time,
          pastTemp: null,
          pastPressure: null,
          futureTemp: d.temp,
          futurePressure: d.pressure
        };
      })
    ];

    return combined;
  }, [activeScenario]);

  // Determine Replay or Future Mode from scrubber
  const isReplayMode = timelineValue < 0;
  const isFutureMode = timelineValue > 0;

  return (
    <div className="relative block">
      <div className="flex flex-col gap-4 p-4 text-zinc-900 min-h-screen font-sans">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col gap-4 border-b border-zinc-200 pb-5">
          <div className="flex items-center justify-between">
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
          
          {/* GLOBAL STATUS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-sm flex flex-col justify-center">
              <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Global Plant Health</div>
              <div className={`text-3xl font-black mt-1 ${DECISION_OS_SCENARIOS[activeScenario]?.healthColor}`}>
                {DECISION_OS_SCENARIOS[activeScenario]?.globalHealth}%
              </div>
            </div>
            <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-sm flex flex-col justify-center">
              <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Efficiency KPI</div>
              <div className="text-2xl font-black mt-1 text-zinc-800">
                {DECISION_OS_SCENARIOS[activeScenario]?.efficiency}
              </div>
            </div>
            <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-sm flex flex-col justify-center">
              <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider">System Risk Status</div>
              <div className="text-lg font-black mt-1 text-zinc-900 leading-tight">
                {DECISION_OS_SCENARIOS[activeScenario]?.downstreamStatus}
              </div>
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
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-zinc-900 font-bold text-lg flex items-center gap-2">
                    <Thermometer className="w-5 h-5 text-amber-500" />
                    Core Temperature & Pressure Projection
                  </h3>
                  <div className="flex gap-4 mt-1">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                      <div className="w-3 h-0.5 bg-blue-500"></div> Historical Temp
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                      <div className="w-3 h-0.5 border-t-2 border-dashed border-purple-500"></div> Future Temp
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-widest font-black text-zinc-400">Target Temp</div>
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
                        x={fullChartData.find(d => d.time === timelineValue)?.label || `T${timelineValue > 0 ? '+' : ''}${timelineValue}m`} 
                        stroke="#2563eb" 
                        label={{ position: 'bottom', value: 'Scrubber', fill: '#2563eb', fontSize: 10, fontWeight: 'bold' }} 
                      />
                    )}

                    {/* Past Data Area/Line */}
                    <Area type="monotone" dataKey="pastTemp" stroke="#3b82f6" strokeWidth={3} fillOpacity={0.2} fill="url(#colorPast)" isAnimationActive={false} />
                    <Line type="monotone" dataKey="pastPressure" stroke="#0ea5e9" strokeWidth={2} dot={false} strokeDasharray="4 4" isAnimationActive={false} />

                    {/* Future Simulated Data Area/Line */}
                    <Area type="monotone" dataKey="futureTemp" stroke="#a855f7" strokeWidth={3} strokeDasharray="6 6" fillOpacity={0.1} fill="url(#colorFuture)" animationDuration={500} />
                    <Line type="monotone" dataKey="futurePressure" stroke="#f43f5e" strokeWidth={2} dot={false} strokeDasharray="4 4" animationDuration={500} />

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

          {/* RIGHT COLUMN: What-If Simulation Matrix & Domino Impacts */}
          <div className="xl:col-span-4 flex flex-col gap-4">
            <div className="rounded-xl border border-zinc-200 bg-white flex flex-col overflow-hidden shadow-md flex-1">
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
                  active={activeScenario === 'shutdown'}
                  onClick={() => { setActiveScenario('shutdown'); setTimelineValue(5); }}
                  title="Option C: Emergency Shutdown"
                  icon={<PowerOff className="w-5 h-5" />}
                  metrics={{ time: "2m", risk: "Critical", riskColor: "text-rose-700 bg-rose-50 border-rose-200", cost: "-45.0%" }}
                />

              </div>
            </div>

            {/* NEW DOMINO-EFFECT CASCADING RISK CARD */}
            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-md transition-all duration-300">
              <div className="flex justify-between items-center mb-4 border-b border-zinc-100 pb-2">
                <h3 className="font-bold text-zinc-900 text-sm tracking-wider uppercase flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                  Cascading Impacts
                </h3>
                <span className="text-[10px] px-2 py-0.5 bg-zinc-100 rounded font-bold uppercase tracking-wider text-zinc-600 border border-zinc-200">
                  {DECISION_OS_SCENARIOS[activeScenario]?.downstreamStatus}
                </span>
              </div>
              <div className="space-y-3">
                {(DECISION_OS_SCENARIOS[activeScenario]?.dependencies || []).map((dep) => {
                  const badgeColors: Record<string, string> = {
                    red: "bg-rose-50 text-rose-700 border-rose-200",
                    amber: "bg-amber-50 text-amber-700 border-amber-200",
                    green: "bg-emerald-50 text-emerald-700 border-emerald-200"
                  };
                  return (
                    <div key={dep.id} className="flex flex-col p-3 bg-zinc-50 rounded-lg border border-zinc-100 transition-all duration-300 hover:border-zinc-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-zinc-800">{dep.name}</span>
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 border rounded ${badgeColors[dep.color] || badgeColors.amber} ${dep.pulse ? 'animate-pulse' : ''}`}>
                          {dep.status}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1 font-medium italic">{dep.message}</p>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ANTI-CRASH TIMELINE SCREEN OVERLAYS */}
      {timelineValue !== 0 && (
        <div className={cn(
          "absolute inset-x-0 bottom-0 top-0 z-50 pointer-events-none backdrop-blur-[2px] transition-all duration-500 flex flex-col justify-start pt-20",
          timelineValue < 0 ? 'bg-amber-50/30' : 'bg-blue-50/30'
        )}>
          <div className="absolute top-8 left-1/2 -translate-x-1/2 shadow-xl px-5 py-3 rounded-full font-mono text-xs font-bold uppercase tracking-widest border flex items-center gap-3 animate-bounce pointer-events-auto bg-white text-zinc-900 border-zinc-200">
            {timelineValue < 0 ? (
              <>
                <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span>
                ⚠️ HISTORICAL REPLAY ENGAGED — DEEPROOT FAULT AUDIT ACTIVE
              </>
            ) : (
              <>
                <span className="w-3 h-3 rounded-full bg-blue-600 animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.6)]"></span>
                🔮 CAUSAL WHAT-IF SANDBOX ACTIVE — FUTURE TIMELINE PROJECTING
              </>
            )}
            <button 
              onClick={() => setTimelineValue(0)} 
              className="ml-4 px-4 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-md text-[10px] transition-colors font-black border border-zinc-300"
            >
              Return Live
            </button>
          </div>
        </div>
      )}
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
