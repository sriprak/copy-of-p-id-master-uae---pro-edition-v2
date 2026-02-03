export enum ComponentStatus {
  OPERATIONAL = 'OPERATIONAL',
  MAINTENANCE_REQUIRED = 'MAINTENANCE_REQUIRED',
  CRITICAL_REPAIR = 'CRITICAL_REPAIR',
  UNKNOWN = 'UNKNOWN'
}

export interface Coordinates {
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
}

export interface PidComponent {
  id: string;
  type: string;
  label: string;
  description: string;
  coordinates: Coordinates;
  initialStatus: ComponentStatus; // What the AI thinks
  currentStatus: ComponentStatus; // What the user sets
  uaeStandardNote: string; // Specific note regarding UAE standards
  lastInspected?: string;
}

export interface AnalysisResult {
  fileName: string;
  timestamp: string;
  components: PidComponent[];
  summary: string;
  version?: number;
}

export interface DatabaseRecord {
  id: string; // UUID
  uploadDate: string;
  pidData: AnalysisResult;
  synced: boolean;
  userId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

export interface UploadRecord {
  id: string;
  fileName: string;
  version: number;
  timestamp: string;
  components: PidComponent[];
  imagePreview: string; // Base64
  summary: string;
}