import React, { useState, useEffect } from 'react';
import { DataGrid } from '../components/DataGrid';
import { createColumnHelper, ColumnDef } from '@tanstack/react-table';

interface SampleDataRow {
  id: string;
  name: string;
  email: string;
  department: string;
  salary: number;
  joinDate: string;
  status: 'Active' | 'Inactive' | 'Pending';
  performance: number;
}

const columnHelper = createColumnHelper<SampleDataRow>();

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
  }),
  columnHelper.accessor('name', {
    header: 'Name',
    size: 150,
    cell: info => (
      <div className="font-medium text-gray-900">
        {info.getValue()}
      </div>
    ),
  }),
  columnHelper.accessor('email', {
    header: 'Email',
    size: 200,
    cell: info => (
      <div className="text-blue-600">
        {info.getValue()}
      </div>
    ),
  }),
  columnHelper.accessor('department', {
    header: 'Department',
    size: 120,
    filterFn: 'includesString',
  }),
  columnHelper.accessor('salary', {
    header: 'Salary',
    size: 100,
    cell: info => (
      <div className="text-right font-mono">
        ${info.getValue().toLocaleString()}
      </div>
    ),
    filterFn: 'inNumberRange',
  }),
  columnHelper.accessor('joinDate', {
    header: 'Join Date',
    size: 120,
    cell: info => new Date(info.getValue()).toLocaleDateString(),
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    size: 100,
    cell: info => {
      const status = info.getValue();
      const statusColors = {
        'Active': 'bg-green-100 text-green-800',
        'Inactive': 'bg-red-100 text-red-800',
        'Pending': 'bg-yellow-100 text-yellow-800',
      };
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
          {status}
        </span>
      );
    },
    filterFn: (row, columnId, value) => {
      return value.includes(row.getValue(columnId));
    },
  }),
  columnHelper.accessor('performance', {
    header: 'Performance',
    size: 120,
    cell: info => {
      const value = info.getValue();
      const color = value >= 80 ? 'text-green-600' : value >= 60 ? 'text-yellow-600' : 'text-red-600';
      return (
        <div className={`${color} font-medium`}>
          {value}%
        </div>
      );
    },
  }),
] as ColumnDef<SampleDataRow>[];

// Generate sample data
const generateSampleData = (count: number): SampleDataRow[] => {
  const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
  const statuses: ('Active' | 'Inactive' | 'Pending')[] = ['Active', 'Inactive', 'Pending'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `EMP${String(i + 1).padStart(4, '0')}`,
    name: `Employee ${i + 1}`,
    email: `employee${i + 1}@company.com`,
    department: departments[Math.floor(Math.random() * departments.length)],
    salary: Math.floor(Math.random() * 100000) + 40000,
    joinDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    performance: Math.floor(Math.random() * 40) + 60, // 60-100
  }));
};

export const GridPage: React.FC = () => {
  const [data, setData] = useState<SampleDataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate loading data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        const sampleData = generateSampleData(150);
        setData(sampleData);
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleBulkAction = (selectedRows: SampleDataRow[], action: string) => {
    console.log('Bulk action:', action, 'on', selectedRows.length, 'rows');
    
    switch (action) {
      case 'delete':
        setData(prevData => 
          prevData.filter(row => !selectedRows.some(selected => selected.id === row.id))
        );
        break;
      case 'activate':
        setData(prevData =>
          prevData.map(row =>
            selectedRows.some(selected => selected.id === row.id)
              ? { ...row, status: 'Active' as const }
              : row
          )
        );
        break;
      case 'deactivate':
        setData(prevData =>
          prevData.map(row =>
            selectedRows.some(selected => selected.id === row.id)
              ? { ...row, status: 'Inactive' as const }
              : row
          )
        );
        break;
    }
  };

  const bulkActions = [
    { label: 'Delete Selected', value: 'delete', variant: 'destructive' as const },
    { label: 'Activate', value: 'activate', variant: 'default' as const },
    { label: 'Deactivate', value: 'deactivate', variant: 'secondary' as const },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Employee Data Grid
        </h1>
        <p className="text-gray-600">
          A comprehensive data grid with sorting, filtering, pagination, and bulk operations.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <DataGrid
          data={data}
          columns={columns}
          loading={loading}
          error={error || undefined}
          enablePagination={true}
          enableSorting={true}
          enableFiltering={true}
          enableExport={true}
          enableSelection={true}
          enableColumnVisibility={true}
          pageSize={20}
          bulkActions={bulkActions}
          onBulkAction={handleBulkAction}
          exportFilename="employees"
        />
      </div>

      {/* Grid Features Demo */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-gray-900 mb-2">Features Included</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Server-side pagination</li>
            <li>• Multi-column sorting</li>
            <li>• Advanced filtering</li>
            <li>• Global search</li>
            <li>• Column visibility toggle</li>
          </ul>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-gray-900 mb-2">Export Options</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• CSV export</li>
            <li>• Excel export</li>
            <li>• Filtered data only</li>
            <li>• Custom filename</li>
            <li>• All columns included</li>
          </ul>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-gray-900 mb-2">Selection Features</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Row selection</li>
            <li>• Select all/none</li>
            <li>• Bulk operations</li>
            <li>• Action confirmation</li>
            <li>• Optimistic updates</li>
          </ul>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-gray-900 mb-2">Performance</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Virtual scrolling</li>
            <li>• Lazy loading</li>
            <li>• Debounced search</li>
            <li>• Memoized renders</li>
            <li>• Efficient updates</li>
          </ul>
        </div>
      </div>
    </div>
  );
};