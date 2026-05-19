/**
 * decisionosApi.ts — Frontend API layer for DecisionOS backend.
 * All calls are wrapped in try/catch. If the backend is offline,
 * functions return null/undefined and the UI uses fallback data.
 */

const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000';

// ── Types ──────────────────────────────────────────────────────────────────

export interface Sensors {
  generator_temperature: number;
  pressure: number;
  flow_rate: number;
  vibration: number;
  load: number;
  coolant_level: number;
  pump_rpm: number;
  valve_opening: number;
}

export interface Telemetry {
  timestamp: number;
  mode: 'NORMAL' | 'FAULT' | 'RECOVERY' | 'TRIPPED';
  system_status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  sensors: Sensors;
  units: Record<string, string>;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  source: string;
  timestamp: number;
  isPrimary: boolean;
  suppressedCount: number;
  relatedAlertIds: string[];
  suggestedAction: string;
}

export interface RootCause {
  rootCause: string;
  confidence: number;
  summary: string;
  chain: string[];
  affectedComponents: string[];
}

export interface SimOption {
  action: string;
  label: string;
  outcome: string;
  timeToStabilize: string;
  risk: string;
  confidence: number;
  costImpact: string;
  projectedTemperature: number;
  projectedPressure: number;
  projectedFlowRate: number;
  projectedRisk: string;
  explanation: string;
}

export interface Decision {
  recommendedAction: string;
  label: string;
  confidence: number;
  risk: string;
  estimatedRecoveryTime: string;
  reason: string;
  aiExplanation: string;
  alternatives: { action: string; label: string; risk: string; confidence: number }[];
  simulationSummary: string;
}

export interface DownstreamSystem {
  id: string;
  name: string;
  health: number;
  risk: string;
  status: string;
  affectedBy: string[];
  explanation: string;
}

export interface HealthStatus {
  status: string;
  ollama: boolean;
  langgraph: boolean;
  mode: string;
}

export interface FullState {
  telemetry: Telemetry;
  alerts: Alert[];
  primaryAlert: Alert | null;
  suppressedAlerts: Alert[];
  rootCause: RootCause;
  decision: Decision;
  simulations: SimOption[];
  downstream: { systems: DownstreamSystem[] };
  replay: { timeline: any[] };
}

export interface WSPayload {
  telemetry: Telemetry;
  alerts: Alert[];
  primaryAlert: Alert | null;
  suppressedAlerts: Alert[];
  rootCause: RootCause;
  decision: Decision;
  downstream: { systems: DownstreamSystem[] };
  replayPoint: any;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

async function safeFetch<T>(path: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return await res.json() as T;
  } catch {
    return null;
  }
}

// ── API Functions ────────────────────────────────────────────────────────────

export const getHealth = () =>
  safeFetch<HealthStatus>('/api/health');

export const getCurrentTelemetry = () =>
  safeFetch<Telemetry>('/api/telemetry/current');

export const getFullState = () =>
  safeFetch<FullState>('/api/state');

export const getAlerts = () =>
  safeFetch<{ alerts: Alert[]; primaryAlert: Alert | null; suppressedAlerts: Alert[] }>('/api/alerts');

export const getRootCause = () =>
  safeFetch<RootCause>('/api/root-cause');

export const getDecisions = () =>
  safeFetch<Decision>('/api/decisions');

export const getDownstream = () =>
  safeFetch<{ systems: DownstreamSystem[] }>('/api/downstream');

export const getReplay = () =>
  safeFetch<{ timeline: any[] }>('/api/replay');

export const triggerFault = () =>
  safeFetch('/api/fault/trigger', { method: 'POST' });

export const resetSystem = () =>
  safeFetch('/api/system/reset', { method: 'POST' });

export const simulateWhatIf = (action?: string) =>
  safeFetch('/api/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: action ?? null }),
  });

export const applyAction = (action: string) =>
  safeFetch('/api/apply-action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action }),
  });

// ── WebSocket ─────────────────────────────────────────────────────────────

const WS_URL = BASE_URL.replace(/^http/, 'ws');

export function connectTelemetry(
  onMessage: (data: WSPayload) => void,
  onError?: (err: Event) => void,
): () => void {
  let ws: WebSocket | null = null;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;
  let stopped = false;

  function connect() {
    if (stopped) return;
    try {
      ws = new WebSocket(`${WS_URL}/ws/telemetry`);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WSPayload;
          onMessage(data);
        } catch { /* ignore parse errors */ }
      };

      ws.onerror = (err) => {
        onError?.(err);
      };

      ws.onclose = () => {
        if (!stopped) {
          retryTimer = setTimeout(connect, 2000);
        }
      };
    } catch {
      if (!stopped) {
        retryTimer = setTimeout(connect, 2000);
      }
    }
  }

  connect();

  // Return cleanup function
  return () => {
    stopped = true;
    if (retryTimer) clearTimeout(retryTimer);
    ws?.close();
  };
}
