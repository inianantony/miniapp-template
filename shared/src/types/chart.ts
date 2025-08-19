export type ChartType = 
  | 'line' 
  | 'bar' 
  | 'pie' 
  | 'area' 
  | 'scatter' 
  | 'heatmap' 
  | 'treemap' 
  | 'gauge' 
  | 'sparkline'
  | 'donut'
  | 'radar';

export interface ChartData {
  labels?: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[] | ChartPoint[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
}

export interface ChartPoint {
  x: number | string;
  y: number;
  label?: string;
}

export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  plugins?: {
    legend?: {
      display: boolean;
      position?: 'top' | 'bottom' | 'left' | 'right';
    };
    tooltip?: {
      enabled: boolean;
      mode?: string;
    };
  };
  scales?: {
    x?: ChartScale;
    y?: ChartScale;
  };
}

export interface ChartScale {
  display?: boolean;
  title?: {
    display: boolean;
    text: string;
  };
  min?: number;
  max?: number;
  type?: 'linear' | 'logarithmic' | 'category' | 'time';
}

export interface ChartConfig {
  type: ChartType;
  data: ChartData;
  options?: ChartOptions;
  width?: number;
  height?: number;
  exportable?: boolean;
}