import { create } from 'zustand';
import type { Alert, CyberEvent, RiskScore, TimelineStep, Transaction } from './types';
import { correlate, computeRiskScore, buildTimeline } from './engine';
import { generateEvents, generateTransactions, generateAttackScenario } from './mockData';

interface AppState {
  events: CyberEvent[];
  transactions: Transaction[];
  alerts: Alert[];
  riskScore: RiskScore;
  selectedAlertId: string | null;
  timeline: TimelineStep[];
  lastSimulated: string | null;

  selectAlert: (id: string | null) => void;
  simulateAttack: () => void;
  resetData: () => void;
}

function freshState() {
  const events = generateEvents(100);
  const transactions = generateTransactions(100);
  const alerts = correlate(events, transactions);
  const riskScore = computeRiskScore(alerts);
  const timeline = alerts[0] ? buildTimeline(alerts[0]) : [];
  return { events, transactions, alerts, riskScore, timeline };
}

const initial = freshState();

export const useStore = create<AppState>((set) => ({
  events: initial.events,
  transactions: initial.transactions,
  alerts: initial.alerts,
  riskScore: initial.riskScore,
  selectedAlertId: initial.alerts[0]?.id ?? null,
  timeline: initial.timeline,
  lastSimulated: null,

  selectAlert: (id) =>
    set((state) => {
      const alert = state.alerts.find((a) => a.id === id) ?? null;
      return {
        selectedAlertId: id,
        timeline: alert ? buildTimeline(alert) : state.timeline,
      };
    }),

  simulateAttack: () => {
    const scenario = generateAttackScenario();
    const events = [...scenario.events, ...generateEvents(95)];
    const transactions = [...scenario.transactions, ...generateTransactions(95)];
    const alerts = correlate(events, transactions);
    const riskScore = computeRiskScore(alerts);
    const topAlert = alerts[0];
    const timeline = topAlert ? buildTimeline(topAlert) : [];
    set({
      events,
      transactions,
      alerts,
      riskScore,
      selectedAlertId: topAlert?.id ?? null,
      timeline,
      lastSimulated: new Date().toISOString(),
    });
  },

  resetData: () => {
    const s = freshState();
    set({
      events: s.events,
      transactions: s.transactions,
      alerts: s.alerts,
      riskScore: s.riskScore,
      selectedAlertId: s.alerts[0]?.id ?? null,
      timeline: s.timeline,
      lastSimulated: null,
    });
  },
}));
