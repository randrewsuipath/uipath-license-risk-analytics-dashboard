import { Router } from 'express';
import { config } from '../config';
import { UiPathDataServiceClient } from '../uipathClient';
import { mockData } from '../utils/mockData';
import type { LicenseMetricMap } from '../types';
const router = Router();
router.get('/', async (req, res) => {
  try {
    let metricMap: LicenseMetricMap[];
    if (config.useMockData) {
      metricMap = mockData.metricMap;
    } else {
      const client = new UiPathDataServiceClient();
      metricMap = await client.query<LicenseMetricMap>('LicenseMetricMap', {
        filter: 'isActive eq true',
        orderBy: 'sortOrder asc',
      });
    }
    res.json({ metricMap });
  } catch (error: any) {
    console.error('Error fetching metric map:', error.message);
    res.status(500).json({ error: 'Failed to fetch metric map' });
  }
});
export default router;