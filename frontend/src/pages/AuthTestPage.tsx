import React, { useState, useEffect } from 'react';
import { tokenManager } from '../services/TokenManager';
import { apiClient } from '../services/APIClient';
import { useUser } from '../hooks/useUser';

export const AuthTestPage: React.FC = () => {
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, token, refreshToken } = useUser();

  useEffect(() => {
    updateTokenInfo();
  }, [token]);

  const updateTokenInfo = () => {
    const info = tokenManager.getTokenInfo();
    const decoded = tokenManager.decodeToken();
    setTokenInfo({ ...info, decoded });
  };

  const handleRefreshToken = async () => {
    setLoading(true);
    setError(null);
    try {
      await refreshToken();
      updateTokenInfo();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh token');
    } finally {
      setLoading(false);
    }
  };

  const handleTestAPI = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.fetchDashboardWidgets();
      setApiResponse(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'API call failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTestHealthCheck = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.healthCheck();
      setApiResponse(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Health check failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Authentication Test</h1>
        <p className="mt-2 text-gray-600">
          Test the JWT token management and API authentication system
        </p>
      </div>

      {/* User Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Current User</h2>
        <pre className="bg-gray-50 p-4 rounded overflow-auto text-sm">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>

      {/* Token Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Token Information</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700">Token Status</p>
            <p className={`text-sm ${tokenManager.isTokenValid() ? 'text-green-600' : 'text-red-600'}`}>
              {tokenManager.isTokenValid() ? '✅ Valid' : '❌ Invalid/Expired'}
            </p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700">Expires At</p>
            <p className="text-sm text-gray-900">
              {tokenInfo?.expiresAt?.toLocaleString() || 'Not available'}
            </p>
          </div>

          {tokenInfo?.decoded && (
            <div>
              <p className="text-sm font-medium text-gray-700">Decoded Token</p>
              <pre className="bg-gray-50 p-4 rounded overflow-auto text-xs">
                {JSON.stringify(tokenInfo.decoded, null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        <button
          onClick={handleRefreshToken}
          disabled={loading}
          className="mt-4 btn-primary"
        >
          {loading ? 'Refreshing...' : 'Refresh Token'}
        </button>
      </div>

      {/* API Test */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">API Test</h2>
        <div className="space-x-4 mb-4">
          <button
            onClick={handleTestAPI}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Testing...' : 'Test Dashboard API (Authenticated)'}
          </button>
          
          <button
            onClick={handleTestHealthCheck}
            disabled={loading}
            className="btn-secondary"
          >
            {loading ? 'Testing...' : 'Test Health Check (No Auth)'}
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
        <h2 className="text-xl font-semibold mb-4">Available Endpoints</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Auth Endpoints</h3>
            <ul className="space-y-1 text-gray-600">
              <li>GET /api/auth/token</li>
              <li>POST /api/auth/verify</li>
              <li>GET /api/auth/userinfo</li>
              <li>POST /api/auth/logout</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Mock API Endpoints</h3>
            <ul className="space-y-1 text-gray-600">
              <li>GET /dashboard/widgets</li>
              <li>GET /metrics/sales</li>
              <li>GET /reports/inventory</li>
              <li>GET /analytics/trends</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};