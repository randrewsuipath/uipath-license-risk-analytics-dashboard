import dotenv from 'dotenv';
dotenv.config();
export interface ServerConfig {
  uipathDataServiceBaseUrl: string;
  uipathAccessToken: string;
  useMockData: boolean;
  defaultSnapshotMonth: string;
  port: number;
}
function getConfig(): ServerConfig {
  const useMockData = process.env.USE_MOCK_DATA === 'true';
  const uipathDataServiceBaseUrl = process.env.UIPATH_DATA_SERVICE_BASE_URL || '';
  const uipathAccessToken = process.env.UIPATH_ACCESS_TOKEN || '';
  if (!useMockData && (!uipathDataServiceBaseUrl || !uipathAccessToken)) {
    console.warn(
      'WARNING: USE_MOCK_DATA is false but UIPATH_DATA_SERVICE_BASE_URL or UIPATH_ACCESS_TOKEN is missing. Falling back to mock mode.'
    );
    return {
      uipathDataServiceBaseUrl: '',
      uipathAccessToken: '',
      useMockData: true,
      defaultSnapshotMonth: process.env.DEFAULT_SNAPSHOT_MONTH || '2024-01',
      port: parseInt(process.env.PORT || '3001', 10),
    };
  }
  return {
    uipathDataServiceBaseUrl,
    uipathAccessToken,
    useMockData,
    defaultSnapshotMonth: process.env.DEFAULT_SNAPSHOT_MONTH || '2024-01',
    port: parseInt(process.env.PORT || '3001', 10),
  };
}
export const config = getConfig();
export function validateConfig(): void {
  if (!config.useMockData) {
    if (!config.uipathDataServiceBaseUrl) {
      throw new Error('UIPATH_DATA_SERVICE_BASE_URL is required when USE_MOCK_DATA=false');
    }
    if (!config.uipathAccessToken) {
      throw new Error('UIPATH_ACCESS_TOKEN is required when USE_MOCK_DATA=false');
    }
  }
  console.log(`Server config: useMockData=${config.useMockData}, port=${config.port}`);
}