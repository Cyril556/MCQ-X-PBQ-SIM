/**
 * Exam Readiness Algorithm
 * Computes a readiness score (0-100) based on multiple weighted factors.
 */

import { loadHistory, loadQuestionStats, getWeakDomains, type ExamAttempt } from './examHistory';

export interface ReadinessBreakdown {
  overall: number;
  recentAccuracy: number;
  consistency: number;
  domainCoverage: number;
  weakDomainStrength: number;
  timeManagement: number;
  volumePracticed: number;
  trend: 'improving' | 'stable' | 'declining';
  readyForExam: boolean;
  recommendations: string[];
}

const ALL_DOMAINS = [
  'General Security Concepts', 'Identity and Access Management', 'Network Security',
  'Cryptography', 'Threats & Vulnerabilities', 'Security Architecture',
  'Cloud Security', 'Incident Response', 'Security Operations',
  'Application Security', 'Governance & Compliance', 'Mobile Device Management',
  'VPN & Remote Access', 'Firewall & ACL Configuration', 'Network Reconnaissance',
];

export function calculateReadiness(): ReadinessBreakdown {
  const history = loadHistory();
  const stats = loadQuestionStats();
  const weakDomains = getWeakDomains();
  const recommendations: string[] = [];

  // 1. Recent accuracy (last 5 attempts, weight 30%)
  const recent = history.slice(0, 5);
  const recentAccuracy = recent.length > 0
    ? Math.round(recent.reduce((sum, a) => sum + a.percentage, 0) / recent.length)
    : 0;

  // 2. Consistency (std dev of last 10 scores, lower is better, weight 15%)
  const last10 = history.slice(0, 10).map(a => a.percentage);
  let consistency = 0;
  if (last10.length >= 3) {
    const mean = last10.reduce((s, v) => s + v, 0) / last10.length;
    const variance = last10.reduce((s, v) => s + (v - mean) ** 2, 0) / last10.length;
    const stdDev = Math.sqrt(variance);
    consistency = Math.max(0, Math.round(100 - stdDev * 2));
  } else if (last10.length > 0) {
    consistency = 50;
  }

  // 3. Domain coverage (% of domains attempted, weight 15%)
  const attemptedDomains = new Set(Object.values(stats).map(s => s.domain));
  const domainCoverage = Math.round((attemptedDomains.size / ALL_DOMAINS.length) * 100);

  // 4. Weak domain strength (lowest domain %, weight 15%)
  const weakDomainStrength = weakDomains.length > 0 ? weakDomains[0].percentage : 0;

  // 5. Time management (avg time per question vs target 60s, weight 10%)
  const allTimes = Object.values(stats).map(s => s.avgTimeSeconds).filter(t => t > 0);
  let timeManagement = 50;
  if (allTimes.length > 0) {
    const avgTime = allTimes.reduce((s, t) => s + t, 0) / allTimes.length;
    if (avgTime <= 60) timeManagement = 100;
    else if (avgTime <= 90) timeManagement = 80;
    else if (avgTime <= 120) timeManagement = 60;
    else timeManagement = Math.max(20, Math.round(100 - (avgTime - 60)));
  }

  // 6. Volume practiced (total questions attempted, weight 15%)
  const totalAttempted = Object.values(stats).reduce((s, q) => s + q.timesAttempted, 0);
  const volumePracticed = Math.min(100, Math.round((totalAttempted / 300) * 100));

  // Trend detection
  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  if (history.length >= 4) {
    const firstHalf = history.slice(Math.floor(history.length / 2)).map(a => a.percentage);
    const secondHalf = history.slice(0, Math.floor(history.length / 2)).map(a => a.percentage);
    const avgFirst = firstHalf.reduce((s, v) => s + v, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((s, v) => s + v, 0) / secondHalf.length;
    if (avgSecond - avgFirst > 5) trend = 'improving';
    else if (avgFirst - avgSecond > 5) trend = 'declining';
  }

  // Weighted overall
  const overall = Math.round(
    recentAccuracy * 0.30 +
    consistency * 0.15 +
    domainCoverage * 0.15 +
    weakDomainStrength * 0.15 +
    timeManagement * 0.10 +
    volumePracticed * 0.15
  );

  // Recommendations
  if (recentAccuracy < 75) recommendations.push('Focus on accuracy — aim for 75%+ on practice sets before attempting full exams.');
  if (domainCoverage < 80) recommendations.push(`You've only covered ${attemptedDomains.size}/${ALL_DOMAINS.length} domains. Practice questions from untouched areas.`);
  if (weakDomains.length > 0 && weakDomains[0].percentage < 60) {
    recommendations.push(`Your weakest domain is "${weakDomains[0].domain}" at ${weakDomains[0].percentage}%. Focus here.`);
  }
  if (totalAttempted < 100) recommendations.push('Complete at least 100 practice questions before the exam for confidence.');
  if (trend === 'declining') recommendations.push('Your scores are trending down. Take a break and review fundamentals.');
  if (timeManagement < 60) recommendations.push('Work on speed — aim for under 60 seconds per MCQ question.');
  if (recommendations.length === 0 && overall >= 80) recommendations.push('You\'re looking exam-ready! Take a full practice exam to confirm.');

  return {
    overall,
    recentAccuracy,
    consistency,
    domainCoverage,
    weakDomainStrength,
    timeManagement,
    volumePracticed,
    trend,
    readyForExam: overall >= 75 && recentAccuracy >= 70 && weakDomainStrength >= 50,
    recommendations,
  };
}
