import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Plus, Search, Filter, Download, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import { Entity } from '@shared/types/entity';

// Mock API call - replace with actual service
const fetchEntities = async () => {
  const response = await fetch('/miniappsdev/myapp/api/entities');
  if (!response.ok) {
    throw new Error('Failed to fetch entities');
  }
  return response.json();
};

export const EntitiesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);

  const { data, isLoading, error, refetch } = useQuery(
    ['entities', searchTerm],
    () => fetchEntities(),
    {
      onError: (error) => {
        toast.error('Failed to load entities');
        console.error('Error loading entities:', error);
      },
    }
  );

  const handleSelectEntity = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedEntities([...selectedEntities, id]);
    } else {
      setSelectedEntities(selectedEntities.filter(entityId => entityId !== id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && data?.data) {
      setSelectedEntities(data.data.map((entity: Entity) => entity.id));
    } else {
      setSelectedEntities([]);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this entity?')) {
      try {
        const response = await fetch(`/miniappsdev/myapp/api/entities/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          toast.success('Entity deleted successfully');
          refetch();
        } else {
          toast.error('Failed to delete entity');
        }
      } catch (error) {
        toast.error('Failed to delete entity');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEntities.length === 0) {
      toast.error('No entities selected');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedEntities.length} entities?`)) {
      try {
        const response = await fetch('/miniappsdev/myapp/api/entities/bulk-delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ids: selectedEntities }),
        });
        
        if (response.ok) {
          toast.success(`${selectedEntities.length} entities deleted successfully`);
          setSelectedEntities([]);
          refetch();
        } else {
          toast.error('Failed to delete entities');
        }
      } catch (error) {
        toast.error('Failed to delete entities');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-12">
          <p className="text-red-600">Failed to load entities</p>
          <button 
            onClick={() => refetch()}
            className="mt-4 btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const entities = data?.data || [];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Entities</h1>
            <p className="mt-2 text-gray-600">
              Manage your entities with full CRUD operations
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button className="btn-primary flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Entity
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search entities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <div className="flex space-x-3">
            <button className="btn-secondary flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
            <button className="btn-secondary flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            {selectedEntities.length > 0 && (
              <button 
                onClick={handleBulkDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete ({selectedEntities.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedEntities.length === entities.length && entities.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {entities.map((entity: Entity) => (
                <tr key={entity.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedEntities.includes(entity.id)}
                      onChange={(e) => handleSelectEntity(entity.id, e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {entity.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 max-w-xs truncate">
                      {entity.description || '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`
                      inline-flex px-2 py-1 text-xs font-semibold rounded-full
                      ${entity.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : entity.status === 'inactive'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                      }
                    `}>
                      {entity.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(entity.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button className="text-primary-600 hover:text-primary-900">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(entity.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {entities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No entities found</p>
          </div>
        )}
      </div>
    </div>
  );
};