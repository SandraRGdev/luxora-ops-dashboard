export interface KPI {
  id: string;
  label: string;
  value: number;
  previousValue?: number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendPercentage?: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  fill?: boolean;
}

export interface BurndownPoint {
  date: Date;
  planned: number;
  actual: number;
}

export interface TeamVelocity {
  week: string;
  completed: number;
  planned: number;
}

export interface ProjectHealth {
  projectId: string;
  projectName: string;
  health: 'healthy' | 'at-risk' | 'critical';
  progress: number;
  tasksTotal: number;
  tasksCompleted: number;
  daysRemaining: number | null;
}
