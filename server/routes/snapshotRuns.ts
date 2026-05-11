import { Router } from 'express';
import { config } from '../config';
import { UiPathDataServiceClient } from '../uipathClient';
import { mockData } from '../utils/mockData';
import type { LicenseSnapshotRun } from '../types';
const router = Router();
router.get('/', async (req, res) => {
  try {
    let snapshotRuns: LicenseSnapshotRun[];
    if (config.useMockData) {
      snapshotRuns = mockData.snapshotRuns;
    } else {
      const client = new UiPathDataServiceClient();
      snapshotRuns = await client.query<LicenseSnapshotRun>('LicenseSnapshotRun', {
        orderBy: 'snapshotMonth desc',
      });
    }
    res.json({ snapshotRuns });
  } catch (error: any) {
    console.error('Error fetching snapshot runs:', error.message);
    res.status(500).json({ error: 'Failed to fetch snapshot runs' });
  }
});
export default router;