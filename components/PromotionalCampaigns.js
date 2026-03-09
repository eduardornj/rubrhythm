'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, DollarSign, Eye, Users, Star, Plus, Edit, Trash2, Play, Pause } from 'lucide-react';

const PromotionalCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    type: 'featured',
    duration: 7,
    budget: 10.50,
    targetAudience: 'all',
    description: ''
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns');
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingCampaign ? `/api/campaigns/${editingCampaign.id}` : '/api/campaigns';
      const method = editingCampaign ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchCampaigns();
        setShowCreateForm(false);
        setEditingCampaign(null);
        setFormData({
          name: '',
          type: 'featured',
          duration: 7,
          budget: 10.50,
          targetAudience: 'all',
          description: ''
        });
      }
    } catch (error) {
      console.error('Error saving campaign:', error);
    }
  };

  const toggleCampaign = async (campaignId, isActive) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      });

      if (response.ok) {
        await fetchCampaigns();
      }
    } catch (error) {
      console.error('Error toggling campaign:', error);
    }
  };

  const deleteCampaign = async (campaignId) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchCampaigns();
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
    }
  };

  const editCampaign = (campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      type: campaign.type,
      duration: campaign.duration,
      budget: campaign.budget,
      targetAudience: campaign.targetAudience,
      description: campaign.description
    });
    setShowCreateForm(true);
  };

  const getCampaignTypeColor = (type) => {
    switch (type) {
      case 'featured': return 'bg-yellow-100 text-yellow-800';
      case 'bump': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCampaignStatusColor = (isActive) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Promotional Campaigns</h2>
            <p className="text-sm text-gray-600 mt-1">Manage your marketing campaigns and promotions</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Campaign</span>
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="featured">Featured Listing ($1.50/day)</option>
                  <option value="bump">Bump Up ($1.00)</option>
                  <option value="premium">Premium Placement ($3.00/day)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget
                </label>
                <input
                  type="number"
                  step="0.50"
                  min="1"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Audience
              </label>
              <select
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="all">All Users</option>
                <option value="new">New Users</option>
                <option value="returning">Returning Users</option>
                <option value="premium">Premium Members</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Describe your campaign goals and strategy..."
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700"
              >
                {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingCampaign(null);
                  setFormData({
                    name: '',
                    type: 'featured',
                    duration: 7,
                    budget: 10.50,
                    targetAudience: 'all',
                    description: ''
                  });
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="p-6">
        {campaigns.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
            <p className="text-gray-600 mb-4">Create your first promotional campaign to boost your visibility</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700"
            >
              Create Campaign
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{campaign.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCampaignTypeColor(campaign.type)}`}>
                        {campaign.type.charAt(0).toUpperCase() + campaign.type.slice(1)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCampaignStatusColor(campaign.isActive)}`}>
                        {campaign.isActive ? 'Active' : 'Paused'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{campaign.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{campaign.duration} days</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">${campaign.budget}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Eye className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{campaign.views || 0} views</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{campaign.clicks || 0} clicks</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => toggleCampaign(campaign.id, campaign.isActive)}
                      className={`p-2 rounded-md ${campaign.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                      title={campaign.isActive ? 'Pause Campaign' : 'Resume Campaign'}
                    >
                      {campaign.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => editCampaign(campaign)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                      title="Edit Campaign"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteCampaign(campaign.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      title="Delete Campaign"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PromotionalCampaigns;