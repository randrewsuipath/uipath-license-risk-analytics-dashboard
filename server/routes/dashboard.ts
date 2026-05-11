import { Router } from 'express';
import { config } from '../config';
import { UiPathDataServiceClient } from '../uipathClient';
import { mockData } from '../utils/mockData';
import { calculateAccountRisk } from '../utils/riskScoring';
import type {
  AccountLicenseConsumptionSnapshot,
  LicenseAccount,
  LicenseMetricMap,
  DashboardSummary,
} from '../types';
const router = Router();
router.get('/', async (req, res) => {
  try {
    const month = (req.query.month as string) || config.defaultSnapshotMonth;
    let accounts: LicenseAccount[];
    let snapshots: AccountLicenseConsumptionSnapshot[];
    let metricMap: LicenseMetricMap[];
    if (config.useMockData) {
      accounts = mockData.accounts;
      snapshots = mockData.consumptionSnapshots.filter(
        (s) => s.snapshotMonth === month
      );
      metricMap = mockData.metricMap;
    } else {
      const client = new UiPathDataServiceClient();
      accounts = await client.query<LicenseAccount>('LicenseAccount', {
        filter: 'isActive eq true',
      });
      snapshots = await client.query<AccountLicenseConsumptionSnapshot>(
        'AccountLicenseConsumptionSnapshot',
        { filter: `snapshotMonth eq '${month}'` }
      );
      metricMap = await client.query<LicenseMetricMap>('LicenseMetricMap', {
        filter: 'isActive eq true',
      });
    }
    const activeAccounts = accounts.filter((a) => a.isActive);
    const accountSnapshots = new Map<string, AccountLicenseConsumptionSnapshot[]>();
    snapshots.forEach((s) => {
      if (!accountSnapshots.has(s.subsidiaryId)) {
        accountSnapshots.set(s.subsidiaryId, []);
      }
      accountSnapshots.get(s.subsidiaryId)!.push(s);
    });
    let highRiskCount = 0;
    let criticalRiskCount = 0;
    accountSnapshots.forEach((snaps, subsidiaryId) => {
      const risk = calculateAccountRisk(snaps, metricMap, `${month}-15T00:00:00Z`);
      if (risk.level === 'High') highRiskCount++;
      if (risk.level === 'Critical') criticalRiskCount++;
    });
    const totalAiUnitsConsumed = snapshots.reduce(
      (sum, s) => sum + s.aiUnitsConsumed,
      0
    );
    const totalAgenticUnitsConsumed = snapshots.reduce(
      (sum, s) => sum + s.agenticUnitsConsumed,
      0
    );
    const totalRobotUnitsConsumed = snapshots.reduce(
      (sum, s) => sum + s.robotUnitsConsumed,
      0
    );
    const uniqueProducts = new Set(snapshots.map((s) => s.licensedProduct));
    const now = new Date(`${month}-15T00:00:00Z`);
    const in90Days = new Date(now);
    in90Days.setDate(in90Days.getDate() + 90);
    const accountsExpiringSoon = new Set(
      snapshots
        .filter((s) => {
          const expiry = new Date(s.licenseEndDate);
          return expiry >= now && expiry <= in90Days;
        })
        .map((s) => s.subsidiaryId)
    );
    const summary: DashboardSummary = {
      latestSnapshotMonth: month,
      activeAccountCount: activeAccounts.length,
      totalAccountCount: accounts.length,
      totalLicensedProducts: uniqueProducts.size,
      totalAiUnitsConsumed,
      totalAgenticUnitsConsumed,
      totalRobotUnitsConsumed,
      accountsExpiringWithin90Days: accountsExpiringSoon.size,
      highRiskAccountCount: highRiskCount,
      criticalRiskAccountCount: criticalRiskCount,
    };
    res.json(summary);
  } catch (error: any) {
    console.error('Error fetching dashboard summary:', error.message);
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
});
export default router;