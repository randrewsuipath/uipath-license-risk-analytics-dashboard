import { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import type { AccountSummary } from '@/types/entities';
interface AccountTableProps {
  accounts: AccountSummary[];
  onRowClick: (subsidiaryId: string) => void;
}
type SortField = 'subsidiaryName' | 'accountDirector' | 'tam' | 'productCount' | 'riskScore' | 'riskLevel';
type SortDirection = 'asc' | 'desc';
export function AccountTable({ accounts, onRowClick }: AccountTableProps) {
  const [sortField, setSortField] = useState<SortField>('riskScore');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  const sortedAccounts = [...accounts].sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];
    if (sortField === 'riskLevel') {
      const riskOrder = { Critical: 5, High: 4, Medium: 3, Low: 2, None: 1 };
      aVal = riskOrder[a.riskLevel];
      bVal = riskOrder[b.riskLevel];
    }
    if (aVal === null || aVal === undefined) aVal = '';
    if (bVal === null || bVal === undefined) bVal = '';
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    } else {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
    }
  });
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronsUpDown className="w-4 h-4 text-gray-400" />;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-gray-700" />
    ) : (
      <ChevronDown className="w-4 h-4 text-gray-700" />
    );
  };
  if (accounts.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-600">No accounts match the current filters</p>
      </div>
    );
  }
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('subsidiaryName')}
              >
                <div className="flex items-center gap-2">
                  Account
                  <SortIcon field="subsidiaryName" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('accountDirector')}
              >
                <div className="flex items-center gap-2">
                  Account Director
                  <SortIcon field="accountDirector" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('tam')}
              >
                <div className="flex items-center gap-2">
                  TAM
                  <SortIcon field="tam" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('productCount')}
              >
                <div className="flex items-center gap-2">
                  Products
                  <SortIcon field="productCount" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('riskLevel')}
              >
                <div className="flex items-center gap-2">
                  Risk Level
                  <SortIcon field="riskLevel" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('riskScore')}
              >
                <div className="flex items-center gap-2">
                  Risk Score
                  <SortIcon field="riskScore" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedAccounts.map((account) => (
              <tr
                key={account.subsidiaryId}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onRowClick(account.subsidiaryId)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{account.subsidiaryName}</div>
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
  );
}