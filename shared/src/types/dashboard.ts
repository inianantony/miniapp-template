export type WidgetType = 'kpi' | 'chart' | 'table' | 'custom' | 'metric';

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  data: any;
  config: WidgetConfig;
  refreshInterval?: number;
  position?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  loading?: boolean;
  error?: string;
}

export interface WidgetConfig {
  [key: string]: any;
}

export interface KPIWidgetData {
  value: number;
  label: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'stable';
    period: string;
  };
  format?: 'number' | 'currency' | 'percentage';
  sparkline?: number[];
}

export interface MetricWidget {
  id: string;
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon?: string;
  color?: string;
}

export interface DashboardLayout {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  isDefault?: boolean;
  userId?: string;
}