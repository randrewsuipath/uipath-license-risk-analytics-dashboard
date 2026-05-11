import { AlertTriangle, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AccountSummary } from '@/types/entities';
interface RiskCardsProps {
  accounts: AccountSummary[];
  onViewDetail: (subsidiaryId: string) => void;
}
export function RiskCards({ accounts, onViewDetail }: RiskCardsProps) {
  const topRiskAccounts = [...accounts]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5)
    .filter(a => a.riskLevel !== 'None');
  if (topRiskAccounts.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">All Accounts Healthy</h3>
        <p className="text-sm text-gray-600">No high-risk accounts detected in the current snapshot</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-orange-600" />
        <h2 className="text-lg font-semibold text-gray-900">Top Risk Accounts</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {topRiskAccounts.map((account) => (
          <div
            key={account.subsidiaryId}
            className={`bg-white border-l-4 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${
              account.riskLevel === 'Critical'
                ? 'border-red-600'
                : account.riskLevel === 'High'
                ? 'border-orange-600'
                : account.riskLevel === 'Medium'
                ? 'border-yellow-600'
                : 'border-blue-600'
            }`}
          >
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 truncate" title={account.subsidiaryName}>
                  {account.subsidiaryName}
                </h3>
                <p className="text-xs text-gray-500">{account.subsidiaryId}</p>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">{account.riskScore}</span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    account.riskLevel === 'Critical'
                      ? 'bg-red-100 text-red-800'
                      : account.riskLevel === 'High'
                      ? 'bg-orange-100 text-orange-800'
                      : account.riskLevel === 'Medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {account.riskLevel}
                </span>
              </div>
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>TAM: {account.tam || 'Unassigned'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>CSM: {account.csm || 'Unassigned'}</span>
                </div>
                <div className="text-gray-500">{account.productCount} products</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => onViewDetail(account.subsidiaryId)}
              >
                View Details
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}