import type { LicenseMetricMap } from '../types';
export function selectPrimaryMetric(
  licensedProduct: string,
  metricMap: LicenseMetricMap[]
): string {
  const mapped = metricMap.find(
    (m) => m.licensedProduct === licensedProduct && m.isActive
  );
  if (mapped) {
    return mapped.primaryUsageMetric;
  }
  const productLower = licensedProduct.toLowerCase();
  if (productLower.includes('agentic')) return 'agenticUnitsConsumed';
  if (productLower.includes('ai')) return 'aiUnitsConsumed';
  if (productLower.includes('du')) return 'duUnitsConsumed';
  if (productLower.includes('platform')) return 'platformUnitsConsumed';
  if (productLower.includes('test robot')) return 'monthlyExecutedHoursTestRobot';
  if (productLower.includes('robot units')) return 'robotUnitsConsumed';
  if (productLower.includes('robot')) return 'monthlyExecutedHours';
  return 'monthlyExecutedHours';
}
export function isRobotProduct(licensedProduct: string): boolean {
  const productLower = licensedProduct.toLowerCase();
  return (
    productLower.includes('robot') ||
    productLower.includes('unattended') ||
    productLower.includes('test robot')
  );
}