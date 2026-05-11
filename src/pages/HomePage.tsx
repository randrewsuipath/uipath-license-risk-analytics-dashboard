import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';
import type { DashboardSummary, AccountSummary } from '@/types/entities';
import { AppLayout } from '@/components/layout/AppLayout';
import { Toaster, toast } from '@/components/ui/sonner';
export function HomePage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [accounts, setAccounts] = useState<AccountSummary[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const months = await apiClient.getSnapshotMonths();
        setAvailableMonths(months);
        const defaultMonth = months[0] || '2024-01';
        setSelectedMonth(defaultMonth);
        const [summaryData, accountsData] = await Promise.all([
          apiClient.getDashboardSummary(defaultMonth),
          apiClient.getAccounts(defaultMonth),
        ]);
        setSummary(summaryData);
        setAccounts(accountsData);
        setError(null);
      } catch (err: any) {
        console.error('Error loading dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);
  useEffect(() => {
    if (!selectedMonth) return;
    const loadMonthData = async () => {
      try {
        const [summaryData, accountsData] = await Promise.all([
          apiClient.getDashboardSummary(selectedMonth),
          apiClient.getAccounts(selectedMonth),
        ]);
        setSummary(summaryData);
        setAccounts(accountsData);
        setError(null);
      } catch (err: any) {
        console.error('Error loading month data:', err);
        setError(err.message || 'Failed to load data for selected month');
        toast.error('Failed to load data for selected month');
      }
    };
    loadMonthData();
  }, [selectedMonth]);
  if (isLoading) {
    return (
      <AppLayout container>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
        <Toaster richColors closeButton />
      </AppLayout>
    );
  }
  if (error) {
    return (
      <AppLayout container>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4 max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Error Loading Dashboard</h2>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
        <Toaster richColors closeButton />
      </AppLayout>
    );
  }
  return (
    <AppLayout container>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">License Risk Dashboard</h1>
            <p className="text-gray-600 mt-1">Monitor account health and utilization metrics</p>
          </div>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Snapshot Month:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {availableMonths.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>
        </div>
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Active Accounts</div>
              <div className="text-3xl font-bold text-gray-900">{summary.activeAccountCount}</div>
              <div className="text-xs text-gray-500 mt-1">of {summary.totalAccountCount} total</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Critical Risk</div>
              <div className="text-3xl font-bold text-red-600">{summary.criticalRiskAccountCount}</div>
              <div className="text-xs text-gray-500 mt-1">accounts need attention</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">High Risk</div>
              <div className="text-3xl font-bold text-orange-600">{summary.highRiskAccountCount}</div>
              <div className="text-xs text-gray-500 mt-1">accounts at risk</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Expiring Soon</div>
              <div className="text-3xl font-bold text-yellow-600">
                {summary.accountsExpiringWithin90Days}
              </div>
              <div className="text-xs text-gray-500 mt-1">within 90 days</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">AI Units Consumed</div>
              <div className="text-3xl font-bold text-gray-900">
                {summary.totalAiUnitsConsumed.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mt-1">this month</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Agentic Units Consumed</div>
              <div className="text-3xl font-bold text-gray-900">
                {summary.totalAgenticUnitsConsumed.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mt-1">this month</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Robot Units Consumed</div>
              <div className="text-3xl font-bold text-gray-900">
                {summary.totalRobotUnitsConsumed.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mt-1">this month</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Licensed Products</div>
              <div className="text-3xl font-bold text-gray-900">{summary.totalLicensedProducts}</div>
              <div className="text-xs text-gray-500 mt-1">unique products</div>
            </div>
          </div>
        )}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Account Overview</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account Director
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TAM
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk Score
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {accounts.map((account) => (
                  <tr key={account.subsidiaryId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {account.subsidiaryName}
                      </div>
                      <div className="text-xs text-gray-500">{account.subsidiaryId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {account.accountDirector || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {account.tam || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {account.productCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          account.riskLevel === 'Critical'
                            ? 'bg-red-100 text-red-800'
                            : account.riskLevel === 'High'
                            ? 'bg-orange-100 text-orange-800'
                            : account.riskLevel === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : account.riskLevel === 'Low'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {account.riskLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {account.riskScore}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Toaster richColors closeButton />
    </AppLayout>
  );
}