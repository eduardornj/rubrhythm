'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Eye, Heart, MessageCircle, TrendingUp, Calendar, DollarSign, Users, Star } from 'lucide-react';

const ProviderAnalytics = () => {
  const { data: session } = useSession();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/provider?timeRange=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500 text-center">No analytics data available</p>
      </div>
    );
  }

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Provider Analytics</h2>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Views</p>
                <p className="text-2xl font-bold text-blue-900">{analytics.totalViews?.toLocaleString() || 0}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-xs text-blue-600 mt-2">
              {analytics.viewsChange > 0 ? '+' : ''}{analytics.viewsChange}% from last period
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Favorites</p>
                <p className="text-2xl font-bold text-green-900">{analytics.totalFavorites?.toLocaleString() || 0}</p>
              </div>
              <Heart className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-xs text-green-600 mt-2">
              {analytics.favoritesChange > 0 ? '+' : ''}{analytics.favoritesChange}% from last period
            </p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Messages</p>
                <p className="text-2xl font-bold text-purple-900">{analytics.totalMessages?.toLocaleString() || 0}</p>
              </div>
              <MessageCircle className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-xs text-purple-600 mt-2">
              {analytics.messagesChange > 0 ? '+' : ''}{analytics.messagesChange}% from last period
            </p>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Avg Rating</p>
                <p className="text-2xl font-bold text-yellow-900">{analytics.averageRating?.toFixed(1) || '0.0'}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
            <p className="text-xs text-yellow-600 mt-2">
              Based on {analytics.totalReviews || 0} reviews
            </p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Over Time */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Views Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.viewsOverTime || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="views" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Traffic Sources */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Sources</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.trafficSources || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {(analytics.trafficSources || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Response Rate */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
              <MessageCircle className="w-10 h-10 text-blue-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Response Rate</h4>
            <p className="text-3xl font-bold text-blue-600">{analytics.responseRate || 0}%</p>
            <p className="text-sm text-gray-500">Average response time: {analytics.avgResponseTime || 'N/A'}</p>
          </div>

          {/* Conversion Rate */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-10 h-10 text-green-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Conversion Rate</h4>
            <p className="text-3xl font-bold text-green-600">{analytics.conversionRate || 0}%</p>
            <p className="text-sm text-gray-500">Views to messages ratio</p>
          </div>

          {/* Profile Completeness */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-3 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="w-10 h-10 text-purple-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Profile Score</h4>
            <p className="text-3xl font-bold text-purple-600">{analytics.profileScore || 0}%</p>
            <p className="text-sm text-gray-500">Profile completeness</p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {analytics.recommendations && analytics.recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
          <div className="space-y-3">
            {analytics.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">{rec.title}</h4>
                  <p className="text-sm text-blue-700">{rec.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderAnalytics;