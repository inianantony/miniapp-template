import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
} from '@tanstack/react-table';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
  Download,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface BulkAction {
  label: string;
  value: string;
  variant: 'default' | 'secondary' | 'destructive';
}

interface DataGridProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  error?: string | null;
  enablePagination?: boolean;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableExport?: boolean;
  enableSelection?: boolean;
  enableColumnVisibility?: boolean;
  pageSize?: number;
  bulkActions?: BulkAction[];
  onBulkAction?: (selectedRows: T[], action: string) => void;
  exportFilename?: string;
  className?: string;
}

export function DataGrid<T>({
  data,
  columns,
  loading = false,
  error,
  enablePagination = true,
  enableSorting = true,
  enableFiltering = true,
  enableExport = true,
  enableSelection = false,
  enableColumnVisibility = true,
  pageSize = 10,
  bulkActions,
  onBulkAction,
  exportFilename = 'data',
  className = '',
}: DataGridProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [showColumnSettings, setShowColumnSettings] = useState(false);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    enableRowSelection: enableSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  const selectedRows = table.getSelectedRowModel().rows.map(row => row.original);

  const handleExport = (format: 'csv' | 'excel') => {
    const exportData = table.getFilteredRowModel().rows.map(row => row.original);
    
    if (format === 'csv') {
      const dataColumns = columns.filter(col => 'accessorKey' in col);
      const csvContent = [
        dataColumns.map(col => {
          if ('header' in col && typeof col.header === 'string') {
            return col.header;
          }
          return col.id || 'Column';
        }).join(','),
        ...exportData.map(row =>
          dataColumns.map(col => {
            const value = 'accessorKey' in col ? (row as any)[col.accessorKey] : '';
            return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exportFilename}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'excel') {
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data');
      XLSX.writeFile(wb, `${exportFilename}.xlsx`);
    }
  };

  const handleBulkAction = (action: string) => {
    if (onBulkAction && selectedRows.length > 0) {
      onBulkAction(selectedRows, action);
      setRowSelection({});
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 mb-2">Error loading data</div>
        <div className="text-gray-600">{error}</div>
      </div>
    );
  }

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {/* Header with controls */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Global search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search all columns..."
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Selected rows info */}
            {enableSelection && selectedRows.length > 0 && (
              <div className="text-sm text-gray-600">
                {selectedRows.length} row{selectedRows.length !== 1 ? 's' : ''} selected
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Bulk actions */}
            {enableSelection && selectedRows.length > 0 && bulkActions && (
              <div className="flex gap-2">
                {bulkActions.map((action) => (
                  <button
                    key={action.value}
                    onClick={() => handleBulkAction(action.value)}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      action.variant === 'destructive'
                        ? 'bg-red-100 text-red-800 hover:bg-red-200'
                        : action.variant === 'secondary'
                        ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            {/* Export buttons */}
            {enableExport && (
              <div className="flex gap-1">
                <button
                  onClick={() => handleExport('csv')}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <Download className="h-4 w-4" />
                  CSV
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <Download className="h-4 w-4" />
                  Excel
                </button>
              </div>
            )}

            {/* Column visibility */}
            {enableColumnVisibility && (
              <div className="relative">
                <button
                  onClick={() => setShowColumnSettings(!showColumnSettings)}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <Settings className="h-4 w-4" />
                  Columns
                </button>
                
                {showColumnSettings && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                    <div className="p-2 max-h-64 overflow-y-auto">
                      {table.getAllColumns().filter(column => column.getCanHide()).map(column => (
                        <label key={column.id} className="flex items-center gap-2 p-1 hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={column.getIsVisible()}
                            onChange={column.getToggleVisibilityHandler()}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">
                            {typeof column.columnDef.header === 'string' 
                              ? column.columnDef.header 
                              : column.id}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  const canSort = header.column.getCanSort();
                  const sortDirection = header.column.getIsSorted();

                  return (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <div className="flex items-center gap-2">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                        
                        {canSort && enableSorting && (
                          <button
                            onClick={header.column.getToggleSortingHandler()}
                            className="flex items-center text-gray-400 hover:text-gray-600"
                          >
                            {sortDirection === 'asc' ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : sortDirection === 'desc' ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronsUpDown className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                      
                      {enableFiltering && header.column.getCanFilter() && (
                        <div className="mt-2">
                          <input
                            type="text"
                            placeholder={`Filter ${header.column.id}...`}
                            value={(header.column.getFilterValue() ?? '') as string}
                            onChange={(e) => header.column.setFilterValue(e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map(row => (
              <tr 
                key={row.id}
                className="hover:bg-gray-50"
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {enablePagination && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div className="text-sm text-gray-700">
              Showing{' '}
              <span className="font-medium">
                {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
              </span>{' '}
              to{' '}
              <span className="font-medium">
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                )}
              </span>{' '}
              of{' '}
              <span className="font-medium">{table.getFilteredRowModel().rows.length}</span> results
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="p-1 rounded border border-gray-300 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
                <ChevronLeft className="h-4 w-4 -ml-1" />
              </button>
              
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="p-1 rounded border border-gray-300 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <span className="text-sm text-gray-700">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </span>
              
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="p-1 rounded border border-gray-300 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="p-1 rounded border border-gray-300 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
                <ChevronRight className="h-4 w-4 -ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}