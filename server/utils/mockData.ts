import type {
  LicenseAccount,
  LicenseSnapshotRun,
  LicenseMetricMap,
  AccountLicenseConsumptionSnapshot,
} from '../types';
const SNAPSHOT_MONTHS = ['2023-10', '2023-11', '2023-12', '2024-01'];
const PRODUCTS = [
  'AI Units',
  'Agentic Units',
  'DU Units',
  'Platform Units',
  'Robot Units',
  'Unattended Robot',
  'Test Robot',
];
const ACCOUNT_DIRECTORS = ['Alice Johnson', 'Bob Smith', 'Carol Williams', null];
const TAMS = ['David Brown', 'Emma Davis', 'Frank Miller', null];
const CSMS = ['Grace Wilson', 'Henry Moore', 'Iris Taylor', null];
const REGIONS = ['North America', 'EMEA', 'APAC', 'LATAM'];
function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function generateSnapshotRuns(): LicenseSnapshotRun[] {
  return SNAPSHOT_MONTHS.map((month, idx) => ({
    snapshotRunKey: `RUN-${month}`,
    snapshotTimestamp: `${month}-15T00:00:00Z`,
    snapshotMonth: month,
    sourceSystem: 'PowerBI',
    sourceReportUrl: `https://powerbi.example.com/reports/${month}`,
    sourceFileName: `license_report_${month}.csv`,
    sourceFileHash: `hash-${month}`,
    sourceRowCount: 120 + idx * 10,
    transformedRowCount: 115 + idx * 10,
    insertedRowCount: 110 + idx * 10,
    failedRowCount: 2,
    skippedDuplicateRowCount: 3,
    status: 'Completed',
    errorSummary: null,
  }));
}
function generateMetricMap(): LicenseMetricMap[] {
  return [
    {
      licensedProduct: 'AI Units',
      primaryUsageMetric: 'aiUnitsConsumed',
      licensedQuantityMetric: 'licensedProductQty',
      displayName: 'AI Units',
      displayUnit: 'units',
      graphType: 'line',
      utilisationFormula: 'aiUnitsConsumed / licensedProductQty',
      sortOrder: 1,
      isActive: true,
      notes: null,
    },
    {
      licensedProduct: 'Agentic Units',
      primaryUsageMetric: 'agenticUnitsConsumed',
      licensedQuantityMetric: 'licensedProductQty',
      displayName: 'Agentic Units',
      displayUnit: 'units',
      graphType: 'line',
      utilisationFormula: 'agenticUnitsConsumed / licensedProductQty',
      sortOrder: 2,
      isActive: true,
      notes: null,
    },
    {
      licensedProduct: 'DU Units',
      primaryUsageMetric: 'duUnitsConsumed',
      licensedQuantityMetric: 'licensedProductQty',
      displayName: 'DU Units',
      displayUnit: 'units',
      graphType: 'line',
      utilisationFormula: 'duUnitsConsumed / licensedProductQty',
      sortOrder: 3,
      isActive: true,
      notes: null,
    },
    {
      licensedProduct: 'Platform Units',
      primaryUsageMetric: 'platformUnitsConsumed',
      licensedQuantityMetric: 'licensedProductQty',
      displayName: 'Platform Units',
      displayUnit: 'units',
      graphType: 'line',
      utilisationFormula: 'platformUnitsConsumed / licensedProductQty',
      sortOrder: 4,
      isActive: true,
      notes: null,
    },
    {
      licensedProduct: 'Robot Units',
      primaryUsageMetric: 'robotUnitsConsumed',
      licensedQuantityMetric: 'licensedProductQty',
      displayName: 'Robot Units',
      displayUnit: 'units',
      graphType: 'line',
      utilisationFormula: 'robotUnitsConsumed / licensedProductQty',
      sortOrder: 5,
      isActive: true,
      notes: null,
    },
    {
      licensedProduct: 'Unattended Robot',
      primaryUsageMetric: 'monthlyExecutedHours',
      licensedQuantityMetric: 'licensedProductQty',
      displayName: 'Unattended Robot',
      displayUnit: 'hours',
      graphType: 'line',
      utilisationFormula: 'monthlyExecutedHours / licensedProductQty',
      sortOrder: 6,
      isActive: true,
      notes: null,
    },
    {
      licensedProduct: 'Test Robot',
      primaryUsageMetric: 'monthlyExecutedHoursTestRobot',
      licensedQuantityMetric: 'licensedProductQty',
      displayName: 'Test Robot',
      displayUnit: 'hours',
      graphType: 'line',
      utilisationFormula: 'monthlyExecutedHoursTestRobot / licensedProductQty',
      sortOrder: 7,
      isActive: true,
      notes: null,
    },
  ];
}
function generateAccounts(): LicenseAccount[] {
  return [
    {
      subsidiaryId: 'SUB-001',
      subsidiaryName: 'Acme Corporation',
      accountDirector: 'Alice Johnson',
      tam: 'David Brown',
      csm: 'Grace Wilson',
      region: 'North America',
      isActive: true,
      firstSeenSnapshotMonth: '2023-10',
      lastSeenSnapshotMonth: '2024-01',
      lastSeenSnapshotTimestamp: '2024-01-15T00:00:00Z',
    },
    {
      subsidiaryId: 'SUB-002',
      subsidiaryName: 'Global Industries Ltd',
      accountDirector: 'Bob Smith',
      tam: 'Emma Davis',
      csm: 'Henry Moore',
      region: 'EMEA',
      isActive: true,
      firstSeenSnapshotMonth: '2023-10',
      lastSeenSnapshotMonth: '2024-01',
      lastSeenSnapshotTimestamp: '2024-01-15T00:00:00Z',
    },
    {
      subsidiaryId: 'SUB-003',
      subsidiaryName: 'Tech Solutions Inc',
      accountDirector: 'Carol Williams',
      tam: 'Frank Miller',
      csm: 'Iris Taylor',
      region: 'APAC',
      isActive: true,
      firstSeenSnapshotMonth: '2023-10',
      lastSeenSnapshotMonth: '2024-01',
      lastSeenSnapshotTimestamp: '2024-01-15T00:00:00Z',
    },
    {
      subsidiaryId: 'SUB-004',
      subsidiaryName: 'Enterprise Systems Co',
      accountDirector: 'Alice Johnson',
      tam: null,
      csm: 'Grace Wilson',
      region: 'North America',
      isActive: true,
      firstSeenSnapshotMonth: '2023-11',
      lastSeenSnapshotMonth: '2024-01',
      lastSeenSnapshotTimestamp: '2024-01-15T00:00:00Z',
    },
    {
      subsidiaryId: 'SUB-005',
      subsidiaryName: 'Innovation Partners',
      accountDirector: null,
      tam: 'Emma Davis',
      csm: null,
      region: 'LATAM',
      isActive: true,
      firstSeenSnapshotMonth: '2023-10',
      lastSeenSnapshotMonth: '2024-01',
      lastSeenSnapshotTimestamp: '2024-01-15T00:00:00Z',
    },
    {
      subsidiaryId: 'SUB-006',
      subsidiaryName: 'Digital Ventures',
      accountDirector: 'Bob Smith',
      tam: 'David Brown',
      csm: 'Henry Moore',
      region: 'EMEA',
      isActive: true,
      firstSeenSnapshotMonth: '2023-12',
      lastSeenSnapshotMonth: '2024-01',
      lastSeenSnapshotTimestamp: '2024-01-15T00:00:00Z',
    },
    {
      subsidiaryId: 'SUB-007',
      subsidiaryName: 'Smart Automation Group',
      accountDirector: 'Carol Williams',
      tam: 'Frank Miller',
      csm: 'Iris Taylor',
      region: 'APAC',
      isActive: true,
      firstSeenSnapshotMonth: '2023-10',
      lastSeenSnapshotMonth: '2024-01',
      lastSeenSnapshotTimestamp: '2024-01-15T00:00:00Z',
    },
    {
      subsidiaryId: 'SUB-008',
      subsidiaryName: 'Future Tech Holdings',
      accountDirector: 'Alice Johnson',
      tam: 'Emma Davis',
      csm: 'Grace Wilson',
      region: 'North America',
      isActive: false,
      firstSeenSnapshotMonth: '2023-10',
      lastSeenSnapshotMonth: '2023-12',
      lastSeenSnapshotTimestamp: '2023-12-15T00:00:00Z',
    },
  ];
}
function generateConsumptionSnapshots(): AccountLicenseConsumptionSnapshot[] {
  const accounts = generateAccounts();
  const snapshots: AccountLicenseConsumptionSnapshot[] = [];
  accounts.forEach((account) => {
    SNAPSHOT_MONTHS.forEach((month) => {
      if (month < account.firstSeenSnapshotMonth || month > account.lastSeenSnapshotMonth) {
        return;
      }
      const productCount = randomInt(2, 4);
      const selectedProducts = [...PRODUCTS]
        .sort(() => Math.random() - 0.5)
        .slice(0, productCount);
      selectedProducts.forEach((product) => {
        const licensedQty = randomInt(50, 500);
        let consumed = 0;
        const riskType = randomInt(1, 10);
        if (riskType <= 2) {
          consumed = Math.floor(licensedQty * randomInt(5, 14) / 100);
        } else if (riskType <= 4) {
          consumed = Math.floor(licensedQty * randomInt(15, 34) / 100);
        } else if (riskType <= 7) {
          consumed = Math.floor(licensedQty * randomInt(35, 69) / 100);
        } else {
          consumed = Math.floor(licensedQty * randomInt(70, 120) / 100);
        }
        const expiryOffset = randomInt(1, 12);
        const expiryDate = new Date('2024-01-15');
        expiryDate.setMonth(expiryDate.getMonth() + expiryOffset);
        const licenseEndDate = expiryDate.toISOString().split('T')[0];
        snapshots.push({
          snapshotRunKey: `RUN-${month}`,
          snapshotTimestamp: `${month}-15T00:00:00Z`,
          snapshotMonth: month,
          subsidiaryId: account.subsidiaryId,
          subsidiaryName: account.subsidiaryName,
          accountDirector: account.accountDirector,
          tam: account.tam,
          csm: account.csm,
          licensedProduct: product,
          licensedProductQty: licensedQty,
          licenseEndDate,
          agenticUnitsConsumed: product === 'Agentic Units' ? consumed : 0,
          aiUnitsConsumed: product === 'AI Units' ? consumed : 0,
          duUnitsConsumed: product === 'DU Units' ? consumed : 0,
          platformUnitsConsumed: product === 'Platform Units' ? consumed : 0,
          robotUnitsConsumed: product === 'Robot Units' ? consumed : 0,
          monthlyExecutedHours:
            product === 'Unattended Robot' ? consumed : 0,
          monthlyExecutedHoursTestRobot:
            product === 'Test Robot' ? consumed : 0,
          sendsTelemetryLastMonth: Math.random() > 0.3,
          sourceFileName: `license_report_${month}.csv`,
          sourceFileHash: `hash-${month}`,
          rowHash: `${account.subsidiaryId}-${product}-${month}`,
          naturalKey: `${account.subsidiaryId}|${product}|${month}`,
          rawRowJson: null,
        });
      });
    });
  });
  return snapshots;
}
export const mockData = {
  accounts: generateAccounts(),
  snapshotRuns: generateSnapshotRuns(),
  metricMap: generateMetricMap(),
  consumptionSnapshots: generateConsumptionSnapshots(),
};