export type ColumnType = 'text' | 'number' | 'date' | 'boolean' | 'select' | 'custom';
export type SortDirection = 'asc' | 'desc' | null;
export type FilterType = 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'range';

export interface GridColumn<T = any> {
  id: string;
  accessorKey: string;
  header: string;
  type?: ColumnType;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  resizable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  visible?: boolean;
  pinned?: 'left' | 'right' | false;
  formatter?: (value: any, row: T) => string;
  cellRenderer?: (value: any, row: T) => React.ReactNode;
  filterOptions?: string[] | number[];
}

export interface GridFilter {
  columnId: string;
  type: FilterType;
  value: any;
  operator?: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'gte' | 'lt' | 'lte' | 'between';
}

export interface GridSort {
  columnId: string;
  direction: SortDirection;
}

export interface GridState {
  sorting: GridSort[];
  filters: GridFilter[];
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  columnVisibility: Record<string, boolean>;
  columnOrder: string[];
  columnSizing: Record<string, number>;
  globalFilter?: string;
}

export interface GridConfig<T = any> {
  columns: GridColumn<T>[];
  data: T[];
  enablePagination?: boolean;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableGlobalFilter?: boolean;
  enableColumnResizing?: boolean;
  enableColumnReordering?: boolean;
  enableRowSelection?: boolean;
  enableExport?: boolean;
  serverSide?: boolean;
  loading?: boolean;
  error?: string;
  onStateChange?: (state: GridState) => void;
  onRowClick?: (row: T) => void;
  onRowSelect?: (selectedRows: T[]) => void;
}

export interface GridExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  includeFiltered?: boolean;
  includeSelected?: boolean;
  filename?: string;
}