import type {
  DashboardSummary,
  AccountSummary,
  AccountDetail,
  HistoricalSnapshot,
  LicenseMetricMap,
  LicenseSnapshotRun,
} from '@/types/entities';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
class ApiClient {
  private baseUrl: string;
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  private async request<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    return response.json();
  }
  async getSnapshotMonths(): Promise<string[]> {
    const data = await this.request<{ months: string[] }>('/snapshot-months');
    return data.months;
  }
  async getDashboardSummary(month?: string): Promise<DashboardSummary> {
    const query = month ? `?month=${month}` : '';
    return this.request<DashboardSummary>(`/dashboard${query}`);
  }
  async getAccounts(month?: string): Promise<AccountSummary[]> {
    const query = month ? `?month=${month}` : '';
    const data = await this.request<{ accounts: AccountSummary[] }>(`/accounts${query}`);
    return data.accounts;
  }
  async getAccountDetail(subsidiaryId: string, month?: string): Promise<AccountDetail> {
    const query = month ? `?month=${month}` : '';
    return this.request<AccountDetail>(`/accounts/${subsidiaryId}${query}`);
  }
  async getAccountHistory(subsidiaryId: string): Promise<HistoricalSnapshot[]> {
    const data = await this.request<{ history: HistoricalSnapshot[] }>(
      `/accounts/${subsidiaryId}/history`
    );
    return data.history;
  }
  async getMetricMap(): Promise<LicenseMetricMap[]> {
    const data = await this.request<{ metricMap: LicenseMetricMap[] }>('/metric-map');
    return data.metricMap;
  }
  async getSnapshotRuns(): Promise<LicenseSnapshotRun[]> {
    const data = await this.request<{ snapshotRuns: LicenseSnapshotRun[] }>(
      '/snapshot-runs'
    );
    return data.snapshotRuns;
  }
}
export const apiClient = new ApiClient(API_BASE_URL);