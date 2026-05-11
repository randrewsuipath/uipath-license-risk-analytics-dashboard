import { useState, useEffect } from 'react';
import { X, Calendar, AlertTriangle, Users, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { apiClient } from '@/lib/apiClient';
import type { AccountDetail, HistoricalSnapshot } from '@/types/entities';
interface AccountDetailDrawerProps {
  subsidiaryId: string | null;
  selectedMonth: string;
  onClose: () => void;
}
export function AccountDetailDrawer({ subsidiaryId, selectedMonth, onClose }: AccountDetailDrawerProps) {
  const [detail, setDetail] = useState<AccountDetail | null>(null);
  const [history, setHistory] = useState<HistoricalSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!subsidiaryId) return;
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [detailData, historyData] = await Promise.all([
          apiClient.getAccountDetail(subsidiaryId, selectedMonth),
          apiClient.getAccountHistory(subsidiaryId),
        ]);
        setDetail(detailData);
        setHistory(historyData);
      } catch (err: any) {
        console.error('Error loading account detail:', err);
        setError(err.message || 'Failed to load account details');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [subsidiaryId, selectedMonth]);
  if (!subsidiaryId) return null;
  const chartData = history.map((snapshot) => {
    const dataPoint: any = { month: snapshot.snapshotMonth };
    snapshot.products.forEach((product) => {
      dataPoint[product.licensedProduct] = product.consumed;
    });
    return dataPoint;
  });
  const productNames = detail?.currentProducts.map(p => p.licensedProduct) || [];
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-4xl h-full overflow-y-auto shadow-xl">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-gray-600">Loading account details...</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Error</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          </div>
        ) : detail ? (
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{detail.subsidiaryName}</h2>
                <p className="text-sm text-gray-500">{detail.subsidiaryId}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-medium">Account Director</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{detail.accountDirector || '—'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-medium">TAM</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{detail.tam || '—'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-medium">CSM</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{detail.csm || '—'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Package className="w-4 h-4" />
                  <span className="text-xs font-medium">Region</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{detail.region || '—'}</p>
              </div>
            </div>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4 mt-6">
                <h3 className="text-lg font-semibold text-gray-900">Current Usage</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {detail.currentProducts.map((product) => (
                    <div key={product.licensedProduct} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">{product.licensedProduct}</h4>
                          <p className="text-xs text-gray-500">Expires: {new Date(product.licenseEndDate).toLocaleDateString()}</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Consumed</span>
                            <span className="font-medium text-gray-900">{product.consumed.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Licensed</span>
                            <span className="font-medium text-gray-900">{product.licensedProductQty.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                product.utilisationPct >= 70
                                  ? 'bg-green-500'
                                  : product.utilisationPct >= 35
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(product.utilisationPct, 100)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Utilization</span>
                            <span className="font-medium text-gray-900">{product.utilisationPct.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="history" className="space-y-4 mt-6">
                <h3 className="text-lg font-semibold text-gray-900">Historical Usage Trends</h3>
                {chartData.length > 0 ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="month" stroke="#6B7280" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        {productNames.map((name, idx) => (
                          <Line
                            key={name}
                            type="monotone"
                            dataKey={name}
                            stroke={colors[idx % colors.length]}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No historical data available</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="risk" className="space-y-4 mt-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <AlertTriangle
                        className={`w-8 h-8 ${
                          detail.riskLevel === 'Critical'
                            ? 'text-red-600'
                            : detail.riskLevel === 'High'
                            ? 'text-orange-600'
                            : detail.riskLevel === 'Medium'
                            ? 'text-yellow-600'
                            : detail.riskLevel === 'Low'
                            ? 'text-blue-600'
                            : 'text-gray-600'
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{detail.riskScore}</h3>
                      <p
                        className={`text-sm font-medium ${
                          detail.riskLevel === 'Critical'
                            ? 'text-red-600'
                            : detail.riskLevel === 'High'
                            ? 'text-orange-600'
                            : detail.riskLevel === 'Medium'
                            ? 'text-yellow-600'
                            : detail.riskLevel === 'Low'
                            ? 'text-blue-600'
                            : 'text-gray-600'
                        }`}
                      >
                        {detail.riskLevel} Risk
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Risk Reasons</h4>
                      <ul className="space-y-2">
                        {detail.risk.reasons.map((reason, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-gray-400 mt-0.5">•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Product Risk Breakdown</h4>
                      <div className="space-y-2">
                        {detail.risk.productRisks.map((pr) => (
                          <div key={pr.licensedProduct} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-900">{pr.licensedProduct}</span>
                              <span
                                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                  pr.riskLevel === 'High'
                                    ? 'bg-red-100 text-red-800'
                                    : pr.riskLevel === 'Medium'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : pr.riskLevel === 'Low'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {pr.riskLevel}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600">{pr.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : null}
      </div>
    </div>
  );
}