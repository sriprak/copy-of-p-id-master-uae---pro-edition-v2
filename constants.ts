import { ComponentStatus } from './types';

export const COMPONENT_STATUS_COLORS: Record<ComponentStatus, string> = {
  [ComponentStatus.OPERATIONAL]: 'text-green-600 bg-green-100 border-green-200',
  [ComponentStatus.MAINTENANCE_REQUIRED]: 'text-amber-600 bg-amber-100 border-amber-200',
  [ComponentStatus.CRITICAL_REPAIR]: 'text-red-600 bg-red-100 border-red-200',
  [ComponentStatus.UNKNOWN]: 'text-gray-600 bg-gray-100 border-gray-200',
};

export const MOCK_DB_DELAY_MS = 1500;