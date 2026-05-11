export interface LicenseAccount {
  subsidiaryId: string;
  subsidiaryName: string;
  accountDirector: string | null;
  tam: string | null;
  csm: string | null;
  region: string | null;
  isActive: boolean;
  firstSeenSnapshotMonth: string;
  lastSeenSnapshotMonth: string;
  lastSeenSnapshotTimestamp: string;
}
export interface LicenseSnapshotRun {
  snapshotRunKey: string;
  snapshotTimestamp: string;
  snapshotMonth: string;
  sourceSystem: string;
  sourceReportUrl: string | null;
  sourceFileName: string;
  sourceFileHash: string;
  sourceRowCount: number;
  transformedRowCount: number;
  insertedRowCount: number;
  failedRowCount: number;
  skippedDuplicateRowCount: number;
  status: string;
  errorSummary: string | null;
}
export interface LicenseMetricMap {
  licensedProduct: string;
  primaryUsageMetric: string;
  licensedQuantityMetric: string;
  displayName: string;
  displayUnit: string;
  graphType: string;
  utilisationFormula: string | null;
  sortOrder: number;
  isActive: boolean;
  notes: string | null;
}
export type RiskLevel = 'None' | 'Low' | 'Medium' | 'High' | 'Critical';
export interface ProductRisk {
  licensedProduct: string;
  consumed: number;
  licensedProductQty: number;
  licenseEndDate: string;
  monthsRemaining: number;
  monthlyExpectedRate: number;
  utilisationPct: number;
  riskLevel: RiskLevel;
  reason: string;
}
export interface AccountRisk {
  score: number;
  level: RiskLevel;
  reasons: string[];
  productRisks: ProductRisk[];
}
export interface DashboardSummary {
  latestSnapshotMonth: string;
  activeAccountCount: number;
  totalAccountCount: number;
  totalLicensedProducts: number;
  totalAiUnitsConsumed: number;
  totalAgenticUnitsConsumed: number;
  totalRobotUnitsConsumed: number;
  accountsExpiringWithin90Days: number;
  highRiskAccountCount: number;
  criticalRiskAccountCount: number;
}
export interface AccountSummary {
  subsidiaryId: string;
  subsidiaryName: string;
  accountDirector: string | null;
  tam: string | null;
  csm: string | null;
  latestSnapshotMonth: string;
  productCount: number;
  totalLicensedQuantity: number;
  totalConsumedUsage: number;
  earliestLicenseExpiry: string | null;
  riskScore: number;
  riskLevel: RiskLevel;
}
export interface AccountDetail extends AccountSummary {
  region: string | null;
  isActive: boolean;
  firstSeenSnapshotMonth: string;
  lastSeenSnapshotMonth: string;
  currentProducts: Array<{
    licensedProduct: string;
    licensedProductQty: number;
    consumed: number;
    licenseEndDate: string;
    utilisationPct: number;
    primaryMetric: string;
    sendsTelemetryLastMonth: boolean;
  }>;
  risk: AccountRisk;
}
export interface HistoricalSnapshot {
  snapshotMonth: string;
  snapshotTimestamp: string;
  products: Array<{
    licensedProduct: string;
    licensedProductQty: number;
    consumed: number;
    licenseEndDate: string;
    primaryMetric: string;
  }>;
}