import type {
  AccountLicenseConsumptionSnapshot,
  LicenseMetricMap,
  AccountRisk,
  ProductRisk,
  RiskLevel,
} from '../types';
import { selectPrimaryMetric, isRobotProduct } from './metricMap';
function getMonthsRemaining(licenseEndDate: string, snapshotDate: string): number {
  const end = new Date(licenseEndDate);
  const snapshot = new Date(snapshotDate);
  const diffMs = end.getTime() - snapshot.getTime();
  const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30);
  return Math.max(1, Math.ceil(diffMonths));
}
function calculateProductRisk(
  snapshot: AccountLicenseConsumptionSnapshot,
  primaryMetric: string,
  snapshotDate: string
): ProductRisk {
  const consumed = (snapshot as any)[primaryMetric] || 0;
  const licensedProductQty = snapshot.licensedProductQty;
  const licenseEndDate = snapshot.licenseEndDate;
  const monthsRemaining = getMonthsRemaining(licenseEndDate, snapshotDate);
  const monthlyExpectedRate = licensedProductQty / monthsRemaining;
  const utilisationRate = monthlyExpectedRate > 0 ? consumed / monthlyExpectedRate : 0;
  const utilisationPct = utilisationRate * 100;
  const isRobot = isRobotProduct(snapshot.licensedProduct);
  let riskLevel: RiskLevel = 'None';
  let reason = '';
  if (licensedProductQty === 0) {
    return {
      licensedProduct: snapshot.licensedProduct,
      consumed,
      licensedProductQty,
      licenseEndDate,
      monthsRemaining,
      monthlyExpectedRate,
      utilisationPct,
      riskLevel: 'None',
      reason: 'No licensed quantity',
    };
  }
  const now = new Date(snapshotDate);
  const expiry = new Date(licenseEndDate);
  if (expiry < now) {
    return {
      licensedProduct: snapshot.licensedProduct,
      consumed,
      licensedProductQty,
      licenseEndDate,
      monthsRemaining,
      monthlyExpectedRate,
      utilisationPct,
      riskLevel: 'None',
      reason: 'License expired',
    };
  }
  if (isRobot) {
    if (utilisationPct < 15) {
      riskLevel = 'High';
      reason = `Robot utilization at ${utilisationPct.toFixed(1)}% (expected 35%+)`;
    } else if (utilisationPct < 25) {
      riskLevel = 'Medium';
      reason = `Robot utilization at ${utilisationPct.toFixed(1)}% (expected 35%+)`;
    } else if (utilisationPct < 35) {
      riskLevel = 'Low';
      reason = `Robot utilization at ${utilisationPct.toFixed(1)}% (expected 35%+)`;
    } else {
      riskLevel = 'None';
      reason = `Robot utilization healthy at ${utilisationPct.toFixed(1)}%`;
    }
  } else {
    if (utilisationPct < 30) {
      riskLevel = 'High';
      reason = `Utilization at ${utilisationPct.toFixed(1)}% (expected 70%+)`;
    } else if (utilisationPct < 50) {
      riskLevel = 'Medium';
      reason = `Utilization at ${utilisationPct.toFixed(1)}% (expected 70%+)`;
    } else if (utilisationPct < 70) {
      riskLevel = 'Low';
      reason = `Utilization at ${utilisationPct.toFixed(1)}% (expected 70%+)`;
    } else {
      riskLevel = 'None';
      reason = `Utilization healthy at ${utilisationPct.toFixed(1)}%`;
    }
  }
  return {
    licensedProduct: snapshot.licensedProduct,
    consumed,
    licensedProductQty,
    licenseEndDate,
    monthsRemaining,
    monthlyExpectedRate,
    utilisationPct,
    riskLevel,
    reason,
  };
}
export function calculateAccountRisk(
  snapshots: AccountLicenseConsumptionSnapshot[],
  metricMap: LicenseMetricMap[],
  snapshotDate: string
): AccountRisk {
  const productRisks: ProductRisk[] = snapshots.map((snapshot) => {
    const primaryMetric = selectPrimaryMetric(snapshot.licensedProduct, metricMap);
    return calculateProductRisk(snapshot, primaryMetric, snapshotDate);
  });
  const riskScores = productRisks.map((pr) => {
    if (pr.riskLevel === 'High') return 60;
    if (pr.riskLevel === 'Medium') return 35;
    if (pr.riskLevel === 'Low') return 15;
    return 0;
  });
  let score = Math.max(...riskScores, 0);
  const atRiskProductCount = productRisks.filter((pr) => pr.riskLevel !== 'None').length;
  if (atRiskProductCount >= 2) {
    score += 10;
  }
  const hasTam = snapshots.some((s) => s.tam);
  const hasCsm = snapshots.some((s) => s.csm);
  if (atRiskProductCount > 0 && (!hasTam || !hasCsm)) {
    score += 10;
  }
  score = Math.min(score, 100);
  let level: RiskLevel = 'None';
  if (score >= 80) level = 'Critical';
  else if (score >= 60) level = 'High';
  else if (score >= 35) level = 'Medium';
  else if (score >= 15) level = 'Low';
  const reasons: string[] = [];
  productRisks.forEach((pr) => {
    if (pr.riskLevel !== 'None') {
      reasons.push(`${pr.licensedProduct}: ${pr.reason}`);
    }
  });
  if (atRiskProductCount >= 2) {
    reasons.push(`Multiple products (${atRiskProductCount}) at risk`);
  }
  if (atRiskProductCount > 0 && !hasTam) {
    reasons.push('No TAM assigned');
  }
  if (atRiskProductCount > 0 && !hasCsm) {
    reasons.push('No CSM assigned');
  }
  const expiringSoon = productRisks.filter((pr) => {
    const expiry = new Date(pr.licenseEndDate);
    const snapshot = new Date(snapshotDate);
    const diffDays = (expiry.getTime() - snapshot.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays > 0 && diffDays <= 30;
  });
  expiringSoon.forEach((pr) => {
    reasons.push(`${pr.licensedProduct} expires within 30 days`);
  });
  return {
    score,
    level,
    reasons,
    productRisks,
  };
}