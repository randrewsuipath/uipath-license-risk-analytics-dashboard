import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';
import type { DashboardSummary, AccountSummary } from '@/types/entities';
import { AppLayout } from '@/components/layout/AppLayout';
import { FilterBar } from '@/components/FilterBar';
import { RiskCards } from '@/components/RiskCards';
import { AccountTable } from '@/components/AccountTable';
import { AccountDetailDrawer } from '@/components/AccountDetailDrawer';
import { Toaster, toast } from '@/components/ui/sonner';
export function HomePage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [allAccounts, setAllAccounts] = useState<AccountSummary[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<AccountSummary[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
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
        setAllAccounts(accountsData);
        setFilteredAccounts(accountsData);
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
        setAllAccounts(accountsData);
        setFilteredAccounts(accountsData);
        setError(null);
      } catch (err: any) {
        console.error('Error loading month data:', err);
        setError(err.message || 'Failed to load data for selected month');
        toast.error('Failed to load data for selected month');
      }
    };
    loadMonthData();
  }, [selectedMonth]);
  const handleFilterChange = useCallback((filtered: AccountSummary[]) => {
    setFilteredAccounts(filtered);
  }, []);
  const handleViewDetail = useCallback((subsidiaryId: string) => {
    setSelectedAccountId(subsidiaryId);
  }, []);
  const handleCloseDetail = useCallback(() => {
    setSelectedAccountId(null);
  }, []);
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
    const isConnectionError = error.includes('Cannot connect to backend server');
    return (
      <AppLayout container>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4 max-w-2xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isConnectionError ? 'Backend Server Not Running' : 'Error Loading Dashboard'}
            </h2>
            <p className="text-gray-600">{error}</p>
            {isConnectionError && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <p className="text-sm font-semibold text-blue-900 mb-2">To start the backend server:</p>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Open a new terminal</li>
                  <li>Run: <code className="bg-blue-100 px-2 py-0.5 rounded">npm run dev:server</code></li>
                  <li>Or run both frontend and backend: <code className="bg-blue-100 px-2 py-0.5 rounded">npm run dev:all</code></li>
                </ol>
              </div>
            )}
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
                <option key={month} value={month}>{month}</option>
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
              <div className="text-3xl font-bold text-yellow-600">{summary.accountsExpiringWithin90Days}</div>
              <div className="text-xs text-gray-500 mt-1">within 90 days</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">AI Units Consumed</div>
              <div className="text-3xl font-bold text-gray-900">{summary.totalAiUnitsConsumed.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">this month</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Agentic Units Consumed</div>
              <div className="text-3xl font-bold text-gray-900">{summary.totalAgenticUnitsConsumed.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">this month</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Robot Units Consumed</div>
              <div className="text-3xl font-bold text-gray-900">{summary.totalRobotUnitsConsumed.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">this month</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Licensed Products</div>
              <div className="text-3xl font-bold text-gray-900">{summary.totalLicensedProducts}</div>
              <div className="text-xs text-gray-500 mt-1">unique products</div>
            </div>
          </div>
        )}
        <RiskCards accounts={filteredAccounts} onViewDetail={handleViewDetail} />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <FilterBar accounts={allAccounts} onFilterChange={handleFilterChange} />
          </div>
          <div className="lg:col-span-3">
            <AccountTable accounts={filteredAccounts} onRowClick={handleViewDetail} />
          </div>
        </div>
      </div>
      <AccountDetailDrawer 
        subsidiaryId={selectedAccountId} 
        selectedMonth={selectedMonth} 
        onClose={handleCloseDetail} 
      />
      <Toaster richColors closeButton />
    </AppLayout>
  );
}