import { Router } from 'express';
import { config } from '../config';
import { UiPathDataServiceClient } from '../uipathClient';
import { mockData } from '../utils/mockData';
import { calculateAccountRisk } from '../utils/riskScoring';
import { selectPrimaryMetric } from '../utils/metricMap';
import type {
  AccountLicenseConsumptionSnapshot,
  LicenseAccount,
  LicenseMetricMap,
  AccountSummary,
  AccountDetail,
  HistoricalSnapshot,
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
      accounts = await client.query<LicenseAccount>('LicenseAccount');
      snapshots = await client.query<AccountLicenseConsumptionSnapshot>(
        'AccountLicenseConsumptionSnapshot',
        { filter: `snapshotMonth eq '${month}'` }
      );
      metricMap = await client.query<LicenseMetricMap>('LicenseMetricMap', {
        filter: 'isActive eq true',
      });
    }
    const accountSnapshots = new Map<string, AccountLicenseConsumptionSnapshot[]>();
    snapshots.forEach((s) => {
      if (!accountSnapshots.has(s.subsidiaryId)) {
        accountSnapshots.set(s.subsidiaryId, []);
      }
      accountSnapshots.get(s.subsidiaryId)!.push(s);
    });
    const accountSummaries: AccountSummary[] = [];
    accounts.forEach((account) => {
      const snaps = accountSnapshots.get(account.subsidiaryId) || [];
      if (snaps.length === 0) return;
      const risk = calculateAccountRisk(snaps, metricMap, `${month}-15T00:00:00Z`);
      const totalLicensedQuantity = snaps.reduce(
        (sum, s) => sum + s.licensedProductQty,
        0
      );
      let totalConsumedUsage = 0;
      snaps.forEach((s) => {
        const primaryMetric = selectPrimaryMetric(s.licensedProduct, metricMap);
        totalConsumedUsage += (s as any)[primaryMetric] || 0;
      });
      const expiryDates = snaps
        .map((s) => new Date(s.licenseEndDate))
        .sort((a, b) => a.getTime() - b.getTime());
      const earliestLicenseExpiry =
        expiryDates.length > 0 ? expiryDates[0].toISOString().split('T')[0] : null;
      accountSummaries.push({
        subsidiaryId: account.subsidiaryId,
        subsidiaryName: account.subsidiaryName,
        accountDirector: account.accountDirector,
        tam: account.tam,
        csm: account.csm,
        latestSnapshotMonth: month,
        productCount: snaps.length,
        totalLicensedQuantity,
        totalConsumedUsage,
        earliestLicenseExpiry,
        riskScore: risk.score,
        riskLevel: risk.level,
      });
    });
    res.json({ accounts: accountSummaries });
  } catch (error: any) {
    console.error('Error fetching accounts:', error.message);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});
router.get('/:subsidiaryId', async (req, res) => {
  try {
    const { subsidiaryId } = req.params;
    const month = (req.query.month as string) || config.defaultSnapshotMonth;
    let account: LicenseAccount | undefined;
    let snapshots: AccountLicenseConsumptionSnapshot[];
    let metricMap: LicenseMetricMap[];
    if (config.useMockData) {
      account = mockData.accounts.find((a) => a.subsidiaryId === subsidiaryId);
      snapshots = mockData.consumptionSnapshots.filter(
        (s) => s.subsidiaryId === subsidiaryId && s.snapshotMonth === month
      );
      metricMap = mockData.metricMap;
    } else {
      const client = new UiPathDataServiceClient();
      const accounts = await client.query<LicenseAccount>('LicenseAccount', {
        filter: `subsidiaryId eq '${subsidiaryId}'`,
      });
      account = accounts[0];
      snapshots = await client.query<AccountLicenseConsumptionSnapshot>(
        'AccountLicenseConsumptionSnapshot',
        {
          filter: `subsidiaryId eq '${subsidiaryId}' and snapshotMonth eq '${month}'`,
        }
      );
      metricMap = await client.query<LicenseMetricMap>('LicenseMetricMap', {
        filter: 'isActive eq true',
      });
    }
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    if (snapshots.length === 0) {
      return res.status(404).json({ error: 'No data for selected month' });
    }
    const risk = calculateAccountRisk(snapshots, metricMap, `${month}-15T00:00:00Z`);
    const totalLicensedQuantity = snapshots.reduce(
      (sum, s) => sum + s.licensedProductQty,
      0
    );
    let totalConsumedUsage = 0;
    snapshots.forEach((s) => {
      const primaryMetric = selectPrimaryMetric(s.licensedProduct, metricMap);
      totalConsumedUsage += (s as any)[primaryMetric] || 0;
    });
    const expiryDates = snapshots
      .map((s) => new Date(s.licenseEndDate))
      .sort((a, b) => a.getTime() - b.getTime());
    const earliestLicenseExpiry =
      expiryDates.length > 0 ? expiryDates[0].toISOString().split('T')[0] : null;
    const currentProducts = snapshots.map((s) => {
      const primaryMetric = selectPrimaryMetric(s.licensedProduct, metricMap);
      const consumed = (s as any)[primaryMetric] || 0;
      const productRisk = risk.productRisks.find(
        (pr) => pr.licensedProduct === s.licensedProduct
      );
      return {
        licensedProduct: s.licensedProduct,
        licensedProductQty: s.licensedProductQty,
        consumed,
        licenseEndDate: s.licenseEndDate,
        utilisationPct: productRisk?.utilisationPct || 0,
        primaryMetric,
        sendsTelemetryLastMonth: s.sendsTelemetryLastMonth,
      };
    });
    const detail: AccountDetail = {
      subsidiaryId: account.subsidiaryId,
      subsidiaryName: account.subsidiaryName,
      accountDirector: account.accountDirector,
      tam: account.tam,
      csm: account.csm,
      region: account.region,
      isActive: account.isActive,
      firstSeenSnapshotMonth: account.firstSeenSnapshotMonth,
      lastSeenSnapshotMonth: account.lastSeenSnapshotMonth,
      latestSnapshotMonth: month,
      productCount: snapshots.length,
      totalLicensedQuantity,
      totalConsumedUsage,
      earliestLicenseExpiry,
      riskScore: risk.score,
      riskLevel: risk.level,
      currentProducts,
      risk,
    };
    res.json(detail);
  } catch (error: any) {
    console.error('Error fetching account detail:', error.message);
    res.status(500).json({ error: 'Failed to fetch account detail' });
  }
});
router.get('/:subsidiaryId/history', async (req, res) => {
  try {
    const { subsidiaryId } = req.params;
    let snapshots: AccountLicenseConsumptionSnapshot[];
    let metricMap: LicenseMetricMap[];
    if (config.useMockData) {
      snapshots = mockData.consumptionSnapshots.filter(
        (s) => s.subsidiaryId === subsidiaryId
      );
      metricMap = mockData.metricMap;
    } else {
      const client = new UiPathDataServiceClient();
      snapshots = await client.query<AccountLicenseConsumptionSnapshot>(
        'AccountLicenseConsumptionSnapshot',
        {
          filter: `subsidiaryId eq '${subsidiaryId}'`,
          orderBy: 'snapshotMonth asc',
        }
      );
      metricMap = await client.query<LicenseMetricMap>('LicenseMetricMap', {
        filter: 'isActive eq true',
      });
    }
    const monthMap = new Map<string, AccountLicenseConsumptionSnapshot[]>();
    snapshots.forEach((s) => {
      if (!monthMap.has(s.snapshotMonth)) {
        monthMap.set(s.snapshotMonth, []);
      }
      monthMap.get(s.snapshotMonth)!.push(s);
    });
    const history: HistoricalSnapshot[] = [];
    monthMap.forEach((snaps, month) => {
      history.push({
        snapshotMonth: month,
        snapshotTimestamp: snaps[0].snapshotTimestamp,
        products: snaps.map((s) => {
          const primaryMetric = selectPrimaryMetric(s.licensedProduct, metricMap);
          const consumed = (s as any)[primaryMetric] || 0;
          return {
            licensedProduct: s.licensedProduct,
            licensedProductQty: s.licensedProductQty,
            consumed,
            licenseEndDate: s.licenseEndDate,
            primaryMetric,
          };
        }),
      });
    });
    history.sort((a, b) => a.snapshotMonth.localeCompare(b.snapshotMonth));
    res.json({ history });
  } catch (error: any) {
    console.error('Error fetching account history:', error.message);
    res.status(500).json({ error: 'Failed to fetch account history' });
  }
});
export default router;