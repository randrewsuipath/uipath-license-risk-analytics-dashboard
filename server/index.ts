import express from 'express';
import cors from 'cors';
import { config, validateConfig } from './config';
import snapshotMonthsRouter from './routes/snapshotMonths';
import dashboardRouter from './routes/dashboard';
import accountsRouter from './routes/accounts';
import metricMapRouter from './routes/metricMap';
import snapshotRunsRouter from './routes/snapshotRuns';
validateConfig();
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/snapshot-months', snapshotMonthsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/accounts', accountsRouter);
app.use('/api/metric-map', metricMapRouter);
app.use('/api/snapshot-runs', snapshotRunsRouter);
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', useMockData: config.useMockData });
});
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
  console.log(`Mock data mode: ${config.useMockData}`);
});