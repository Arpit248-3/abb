/**
 * useDecisionOS.ts — Unified state hook for DecisionOS dashboard.
 * Manages WebSocket connection, backend polling, and all dashboard state.
 * Falls back to mock data if backend is offline.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  connectTelemetry,
  getHealth, getFullState, triggerFault as apiFaultTrigger,
  resetSystem as apiResetSystem, simulateWhatIf, applyAction as apiApplyAction,
  getDecisions,
  type Telemetry, type Alert, type RootCause, type Decision,
  type SimOption, type DownstreamSystem, type WSPayload, type HealthStatus,
} from '@/api/decisionosApi';

// ── Fallback / default data (used when backend is offline) ─────────────────

const FALLBACK_TELEMETRY: Telemetry = {
  timestamp: Date.now() / 1000,
  mode: 'NORMAL',
  system_status: 'NORMAL',
  sensors: {
    generator_temperature: 72,
    pressure: 68,
    flow_rate: 75,
    vibration: 0.22,
    load: 72,
    coolant_level: 88,
    pump_rpm: 1450,
    valve_opening: 75,
  },
  units: {
    generator_temperature: '°C', pressure: 'bar', flow_rate: 'L/min',
    vibration: 'g', load: '%', coolant_level: '%', pump_rpm: 'RPM', valve_opening: '%',
  },
};

const FALLBACK_ROOT_CAUSE: RootCause = {
  rootCause: 'None',
  confidence: 0.99,
  summary: 'All systems operating normally. Backend offline — showing fallback data.',
  chain: [],
  affectedComponents: [],
};

const FALLBACK_DECISION: Decision = {
  recommendedAction: 'NONE',
  label: 'No Action Required',
  confidence: 0.99,
  risk: 'NONE',
  estimatedRecoveryTime: 'N/A',
  reason: 'System is stable. Backend offline — showing fallback data.',
  aiExplanation: 'AI explanation unavailable — backend is offline.',
  alternatives: [],
  simulationSummary: 'No simulation required.',
};

const MAX_HISTORY = 60;

// ── Hook ────────────────────────────────────────────────────────────────────

export function useDecisionOS() {
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [isOllamaOnline, setIsOllamaOnline] = useState(false);
  const [isLangGraphEnabled, setIsLangGraphEnabled] = useState(false);

  const [telemetry, setTelemetry] = useState<Telemetry>(FALLBACK_TELEMETRY);
  const [telemetryHistory, setTelemetryHistory] = useState<Telemetry[]>([]);

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [primaryAlert, setPrimaryAlert] = useState<Alert | null>(null);
  const [suppressedAlerts, setSuppressedAlerts] = useState<Alert[]>([]);

  const [rootCause, setRootCause] = useState<RootCause>(FALLBACK_ROOT_CAUSE);
  const [decision, setDecision] = useState<Decision>(FALLBACK_DECISION);
  const [simulations, setSimulations] = useState<SimOption[]>([]);
  const [downstream, setDownstream] = useState<DownstreamSystem[]>([]);
  const [replay, setReplay] = useState<any[]>([]);

  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsCleanupRef = useRef<(() => void) | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  // ── Apply WS / API payload ───────────────────────────────────────────────

  const applyPayload = useCallback((payload: Partial<WSPayload & { simulations?: SimOption[]; replay?: { timeline: any[] } }>) => {
    if (!isMountedRef.current) return;

    if (payload.telemetry) {
      setTelemetry(payload.telemetry);
      setTelemetryHistory(prev => {
        const next = [...prev, payload.telemetry!];
        return next.slice(-MAX_HISTORY);
      });
    }
    if (payload.alerts !== undefined) setAlerts(payload.alerts);
    if (payload.primaryAlert !== undefined) setPrimaryAlert(payload.primaryAlert);
    if (payload.suppressedAlerts !== undefined) setSuppressedAlerts(payload.suppressedAlerts);
    if (payload.rootCause) setRootCause(payload.rootCause);
    if (payload.decision) setDecision(payload.decision);
    if (payload.downstream?.systems) setDownstream(payload.downstream.systems);
    if (payload.simulations) setSimulations(payload.simulations);
    if (payload.replay?.timeline) setReplay(payload.replay.timeline);
  }, []);

  // ── Health check + initial hydration ────────────────────────────────────

  const checkBackend = useCallback(async () => {
    const health = await getHealth();
    if (!isMountedRef.current) return;

    if (health) {
      setIsBackendOnline(true);
      setIsOllamaOnline(health.ollama);
      setIsLangGraphEnabled(health.langgraph);

      // Hydrate full state once on connect
      const state = await getFullState();
      if (state && isMountedRef.current) {
        applyPayload(state as any);
      }
    } else {
      setIsBackendOnline(false);
    }
  }, [applyPayload]);

  // ── WebSocket connection ─────────────────────────────────────────────────

  const connectWS = useCallback(() => {
    if (wsCleanupRef.current) {
      wsCleanupRef.current();
    }

    const cleanup = connectTelemetry(
      (data: WSPayload) => {
        if (!isMountedRef.current) return;
        setIsBackendOnline(true);
        applyPayload(data);
      },
      () => {
        if (isMountedRef.current) setIsBackendOnline(false);
      },
    );
    wsCleanupRef.current = cleanup;
  }, [applyPayload]);

  // ── Fallback polling if WS fails ─────────────────────────────────────────

  const startPolling = useCallback(() => {
    const poll = async () => {
      if (!isMountedRef.current) return;
      const health = await getHealth();
      if (health && isMountedRef.current) {
        setIsBackendOnline(true);
        setIsOllamaOnline(health.ollama);
        const state = await getFullState();
        if (state && isMountedRef.current) applyPayload(state as any);
      } else if (isMountedRef.current) {
        setIsBackendOnline(false);
      }
      pollTimerRef.current = setTimeout(poll, 5000);
    };
    poll();
  }, [applyPayload]);

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  useEffect(() => {
    isMountedRef.current = true;
    checkBackend();
    connectWS();
    startPolling();

    return () => {
      isMountedRef.current = false;
      wsCleanupRef.current?.();
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Action handlers ───────────────────────────────────────────────────────

  const triggerFault = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFaultTrigger() as any;
      if (result) applyPayload(result);
    } catch (e) {
      setError('Failed to trigger fault.');
    } finally {
      setLoading(false);
    }
  }, [applyPayload]);

  const resetSystemFn = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await apiResetSystem();
      setAlerts([]);
      setPrimaryAlert(null);
      setSuppressedAlerts([]);
      setRootCause(FALLBACK_ROOT_CAUSE);
      setDecision(FALLBACK_DECISION);
      setSimulations([]);
      setReplay([]);
      setTelemetry(FALLBACK_TELEMETRY);
      setTelemetryHistory([]);
    } catch (e) {
      setError('Failed to reset system.');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshDecision = useCallback(async () => {
    setLoading(true);
    try {
      const d = await getDecisions();
      if (d && isMountedRef.current) setDecision(d);
    } finally {
      setLoading(false);
    }
  }, []);

  const runSimulation = useCallback(async () => {
    setLoading(true);
    try {
      const result = await simulateWhatIf() as any;
      if (result?.options && isMountedRef.current) setSimulations(result.options);
    } finally {
      setLoading(false);
    }
  }, []);

  const applyAction = useCallback(async (action: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiApplyAction(action) as any;
      if (result && isMountedRef.current) {
        applyPayload(result);
        setSelectedAction(action);
      }
    } catch (e) {
      setError('Failed to apply action.');
    } finally {
      setLoading(false);
    }
  }, [applyPayload]);

  const selectAction = useCallback((action: string) => {
    setSelectedAction(action);
  }, []);

  return {
    // Status
    isBackendOnline,
    isOllamaOnline,
    isLangGraphEnabled,
    // Data
    telemetry,
    telemetryHistory,
    alerts,
    primaryAlert,
    suppressedAlerts,
    rootCause,
    decision,
    simulations,
    downstream,
    replay,
    // UI state
    selectedAction,
    loading,
    error,
    // Actions
    triggerFault,
    resetSystem: resetSystemFn,
    refreshDecision,
    runSimulation,
    applyAction,
    selectAction,
  };
}
