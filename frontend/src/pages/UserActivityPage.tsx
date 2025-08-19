import React, { useState, useEffect, useCallback } from 'react';
import { DataGrid } from '../components/DataGrid';
import { createColumnHelper, ColumnDef } from '@tanstack/react-table';
import { UserActivity, UserActivityRequestFilter } from '@shared/types/userActivity';
import { UserActivityService } from '../services/UserActivityService';
import { Calendar, MapPin, Monitor, User, Settings, Activity } from 'lucide-react';

const columnHelper = createColumnHelper<UserActivity>();
const userActivityService = new UserActivityService();

const columns = [
  columnHelper.display({
    id: 'select',
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
        className="rounded border-gray-300"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        className="rounded border-gray-300"
      />
    ),
    size: 40,
  }),
  columnHelper.accessor('id', {
    header: 'ID',
    size: 80,
    cell: info => (
      <div className="font-mono text-gray-600">
        #{info.getValue()}
      </div>
    ),
  }),
  columnHelper.accessor('userName', {
    header: 'User Name',
    size: 150,
    cell: info => (
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-blue-500" />
        <span className="font-medium text-gray-900">
          {info.getValue()}
        </span>
      </div>
    ),
  }),
  columnHelper.accessor('activityAt', {
    header: 'Activity At',
    size: 180,
    cell: info => (
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-gray-400" />
        <div>
          <div className="text-sm text-gray-900">
            {new Date(info.getValue()).toLocaleDateString()}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(info.getValue()).toLocaleTimeString()}
          </div>
        </div>
      </div>
    ),
  }),
  columnHelper.accessor('controller', {
    header: 'Controller',
    size: 120,
    cell: info => (
      <div className="flex items-center gap-2">
        <Settings className="h-4 w-4 text-purple-500" />
        <span className="text-gray-900 font-medium">
          {info.getValue()}
        </span>
      </div>
    ),
    filterFn: 'includesString',
  }),
  columnHelper.accessor('action', {
    header: 'Action',
    size: 100,
    cell: info => {
      const action = info.getValue();
      const actionColors = {
        'Login': 'bg-green-100 text-green-800',
        'Logout': 'bg-red-100 text-red-800',
        'Create': 'bg-blue-100 text-blue-800',
        'Update': 'bg-yellow-100 text-yellow-800',
        'Delete': 'bg-red-100 text-red-800',
        'View': 'bg-gray-100 text-gray-800',
        'Export': 'bg-purple-100 text-purple-800',
        'Import': 'bg-indigo-100 text-indigo-800',
        'Search': 'bg-cyan-100 text-cyan-800',
      };
      return (
        <div className="flex items-center gap-1">
          <Activity className="h-3 w-3" />
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${actionColors[action as keyof typeof actionColors] || 'bg-gray-100 text-gray-800'}`}>
            {action}
          </span>
        </div>
      );
    },
    filterFn: (row, columnId, value) => {
      return value.includes(row.getValue(columnId));
    },
  }),
  columnHelper.accessor('activityIp', {
    header: 'IP Address',
    size: 130,
    cell: info => (
      <div className="font-mono text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
        {info.getValue()}
      </div>
    ),
  }),
  columnHelper.accessor('ipCountry', {
    header: 'Country',
    size: 80,
    cell: info => (
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-green-500" />
        <span className="font-medium text-gray-900">
          {info.getValue()}
        </span>
      </div>
    ),
    filterFn: (row, columnId, value) => {
      return value.includes(row.getValue(columnId));
    },
  }),
  columnHelper.accessor('userAgent', {
    header: 'User Agent',
    size: 200,
    cell: info => (
      <div className="flex items-center gap-2 truncate">
        <Monitor className="h-4 w-4 text-gray-400 flex-shrink-0" />
        <span className="text-xs text-gray-600 truncate" title={info.getValue()}>
          {info.getValue()}
        </span>
      </div>
    ),
  }),
] as ColumnDef<UserActivity>[];

export const UserActivityPage: React.FC = () => {
  const [data, setData] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(0);
  
  // Filter state
  const [filters, setFilters] = useState<UserActivityRequestFilter>({
    page: 1,
    pageSize: 25,
    sortBy: 'id',
    sortDirection: 'desc',
  });

  const fetchUserActivities = useCallback(async (requestFilters: UserActivityRequestFilter) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await userActivityService.getUserActivities(requestFilters);
      
      setData(result.data);
      setTotalCount(result.totalCount);
      setCurrentPage(result.page);
      setPageSize(result.pageSize);
      setTotalPages(result.totalPages);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user activities';
      setError(errorMessage);
      console.error('Error fetching user activities:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchUserActivities(filters);
  }, []);

  // Handle filter changes with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUserActivities(filters);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [filters, fetchUserActivities]);

  const handleBulkAction = (selectedRows: UserActivity[], action: string) => {
    console.log('Bulk action:', action, 'on', selectedRows.length, 'rows');
    
    switch (action) {
      case 'export':
        // Export selected activities
        console.log('Exporting activities:', selectedRows.map(row => row.id));
        break;
      case 'analyze':
        // Analyze selected activities  
        console.log('Analyzing activities:', selectedRows.map(row => row.id));
        break;
    }
  };

  const bulkActions = [
    { label: 'Export Selected', value: 'export', variant: 'default' as const },
    { label: 'Analyze', value: 'analyze', variant: 'secondary' as const },
  ];

  const apiConfig = userActivityService.getApiConfig();

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-900">
            User Activity Log
          </h1>
          <div className="flex items-center gap-2 text-sm">
            <div className={`px-2 py-1 rounded text-xs ${apiConfig.isUsingMockApi ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
              {apiConfig.isUsingMockApi ? 'Mock API' : 'Live API'}
            </div>
            <div className="text-gray-500">
              {apiConfig.baseUrl}
            </div>
          </div>
        </div>
        <p className="text-gray-600">
          Track and analyze user activities with advanced filtering and server-side pagination.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User Name
            </label>
            <input
              type="text"
              placeholder="Filter by username..."
              value={filters.userName || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, userName: e.target.value || undefined, page: 1 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date From
            </label>
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value || undefined, page: 1 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date To
            </label>
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value || undefined, page: 1 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Page Size
            </label>
            <select
              value={filters.pageSize}
              onChange={(e) => setFilters(prev => ({ ...prev, pageSize: parseInt(e.target.value), page: 1 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {data.length} of {totalCount} activities (Page {currentPage} of {totalPages})
          </div>
          <button
            onClick={() => setFilters({ page: 1, pageSize: 25, sortBy: 'id', sortDirection: 'desc' })}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Data Grid */}
      <div className="bg-white rounded-lg shadow">
        <DataGrid
          data={data}
          columns={columns}
          loading={loading}
          error={error || undefined}
          enablePagination={false} // We handle pagination manually via API
          enableSorting={true}
          enableFiltering={false}  // We handle filtering via API
          enableExport={true}
          enableSelection={true}
          enableColumnVisibility={true}
          pageSize={pageSize}
          bulkActions={bulkActions}
          onBulkAction={handleBulkAction}
          exportFilename="user-activities"
        />
      </div>

      {/* API Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page! - 1) }))}
            disabled={currentPage <= 1}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <span className="px-3 py-2 text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setFilters(prev => ({ ...prev, page: Math.min(totalPages, prev.page! + 1) }))}
            disabled={currentPage >= totalPages}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Debug Info */}
      {import.meta.env.DEV && (
        <div className="mt-6 bg-gray-100 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Debug Info</h3>
          <div className="text-xs text-gray-600 space-y-1">
            <div>API Base: {apiConfig.baseUrl}</div>
            <div>Using Mock API: {apiConfig.isUsingMockApi ? 'Yes' : 'No'}</div>
            <div>Current Filters: {JSON.stringify(filters, null, 2)}</div>
          </div>
        </div>
      )}
    </div>
  );
};