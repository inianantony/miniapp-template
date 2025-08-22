import React, { useState } from 'react';
import { useUser } from '../hooks/useUser';

export const AuthTestPage: React.FC = () => {
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  const handleTestAPI = async (endpoint: string, description: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}${endpoint}`, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`${description} failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setApiResponse({ endpoint, description, data });
    } catch (err) {
      setError(err instanceof Error ? err.message : `${description} failed`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Authentication Test</h1>
        <p className="mt-2 text-gray-600">
          Test the backend API authentication system and user info from headers
        </p>
      </div>

      {/* User Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Current User (from Headers)</h2>
        <pre className="bg-gray-50 p-4 rounded overflow-auto text-sm">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>

      {/* API Test */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Backend API Test</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <button
            onClick={() => handleTestAPI('/health', 'Health Check')}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Health Check'}
          </button>
          
          <button
            onClick={() => handleTestAPI('/auth/token', 'Get Auth Token')}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Get Auth Token'}
          </button>
          
          <button
            onClick={() => handleTestAPI('/user-activities/cache-stats', 'Cache Stats')}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'User Activity Cache Stats'}
          </button>
          
          <button
            onClick={() => handleTestAPI('/user-preferences', 'User Preferences')}
            disabled={loading}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'User Preferences'}
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
        
        {apiResponse && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">API Response</p>
            <pre className="bg-gray-50 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Endpoints */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Available Backend Endpoints</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Auth & System</h3>
            <ul className="space-y-1 text-gray-600">
              <li>GET /api/health</li>
              <li>GET /api/auth/token</li>
              <li>POST /api/auth/verify</li>
              <li>GET /api/auth/userinfo</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Data APIs</h3>
            <ul className="space-y-1 text-gray-600">
              <li>GET /api/user-activities</li>
              <li>GET /api/user-activities/cache-stats</li>
              <li>GET /api/user-preferences</li>
              <li>GET /api/entities</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> All external API calls (like UserActivity data) are now proxied through the backend. 
            The backend handles token management, caching, and external API communication.
          </p>
        </div>
      </div>
    </div>
  );
};