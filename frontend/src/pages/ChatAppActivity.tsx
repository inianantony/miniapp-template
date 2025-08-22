import React, { useEffect, useState } from 'react';
import { UserActivity, UserActivityResponse } from '@miniapp-template/shared';
import toast from 'react-hot-toast';

export const ChatAppActivity: React.FC = () => {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChatAppActivities();
  }, []);

  const fetchChatAppActivities = async () => {
    try {
      const apiBase = import.meta.env.VITE_API_BASE || '/defaultbasepath/defaultapp/api';
      const response = await fetch(`${apiBase}/user-activities?controller=ChatApp`, {
        credentials: 'same-origin',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chat app activities');
      }

      const result = await response.json() as UserActivityResponse;
      setActivities(result.data);
    } catch (error) {
      console.error('Error fetching chat app activities:', error);
      toast.error('Failed to load chat app activities');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Chat App Activity</h1>
        <p className="text-gray-600 mt-1">Activity logs for ChatApp controller</p>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No chat app activities found</div>
          <p className="text-gray-400 mt-2">Activities with Controller = ChatApp will appear here</p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Chat App Activities ({activities.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {activities.map((activity) => (
              <div key={activity.Id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {activity.Action}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {activity.RequestParam || 'No description'}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <span>User: {activity.UserName}</span>
                      <span>Controller: {activity.Controller}</span>
                      <span>IP: {activity.ActivityIp}</span>
                      <span>Country: {activity.IpCountry}</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(activity.ActivityAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};