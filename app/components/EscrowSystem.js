'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function EscrowSystem({ listingId, providerId, onEscrowUpdate }) {
  const { data: session } = useSession();
  const [escrows, setEscrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEscrow, setNewEscrow] = useState({
    amount: '',
    description: '',
    terms: ''
  });
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchEscrows();
    }
  }, [session, listingId]);

  const fetchEscrows = async () => {
    try {
      const params = new URLSearchParams();
      if (listingId) params.append('listingId', listingId);
      if (providerId) params.append('providerId', providerId);
      
      const response = await fetch(`/api/escrow?${params}`);
      if (response.ok) {
        const data = await response.json();
        setEscrows(data.escrows);
      }
    } catch (error) {
      console.error('Error fetching escrows:', error);
    } finally {
      setLoading(false);
    }
  };

  const createEscrow = async () => {
    if (!newEscrow.amount || !newEscrow.description) {
      alert('Please fill in all required fields');
      return;
    }

    setProcessing('create');
    try {
      const response = await fetch('/api/escrow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newEscrow,
          listingId,
          providerId,
          amount: parseFloat(newEscrow.amount)
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setEscrows(prev => [data.escrow, ...prev]);
        setNewEscrow({ amount: '', description: '', terms: '' });
        setShowCreateForm(false);
        onEscrowUpdate?.(data.escrow);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create escrow');
      }
    } catch (error) {
      console.error('Error creating escrow:', error);
      alert('An error occurred while creating the escrow');
    } finally {
      setProcessing(null);
    }
  };

  const updateEscrowStatus = async (escrowId, action, reason = '') => {
    setProcessing(escrowId);
    try {
      const response = await fetch('/api/escrow', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          escrowId,
          action,
          reason
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setEscrows(prev => prev.map(escrow => 
          escrow.id === escrowId ? data.escrow : escrow
        ));
        onEscrowUpdate?.(data.escrow);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update escrow');
      }
    } catch (error) {
      console.error('Error updating escrow:', error);
      alert('An error occurred while updating the escrow');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'funded': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'in_progress': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'completed': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'disputed': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'cancelled': return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
      case 'refunded': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending Payment';
      case 'funded': return 'Funded & Waiting';
      case 'in_progress': return 'Service in Progress';
      case 'completed': return 'Completed';
      case 'disputed': return 'Under Dispute';
      case 'cancelled': return 'Cancelled';
      case 'refunded': return 'Refunded';
      default: return status;
    }
  };

  const canPerformAction = (escrow, action) => {
    const isClient = session?.user?.id === escrow.clientId;
    const isProvider = session?.user?.id === escrow.providerId;
    const isAdmin = session?.user?.role === 'admin';

    switch (action) {
      case 'fund':
        return isClient && escrow.status === 'pending';
      case 'start':
        return isProvider && escrow.status === 'funded';
      case 'complete':
        return isProvider && escrow.status === 'in_progress';
      case 'confirm':
        return isClient && escrow.status === 'in_progress';
      case 'dispute':
        return (isClient || isProvider) && ['funded', 'in_progress'].includes(escrow.status);
      case 'resolve':
        return isAdmin && escrow.status === 'disputed';
      case 'cancel':
        return (isClient || isProvider || isAdmin) && ['pending', 'funded'].includes(escrow.status);
      default:
        return false;
    }
  };

  if (loading) {
    return (
      <div className="bg-dark-gray/50 backdrop-blur-sm rounded-2xl p-6 border border-secondary/20">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-gray/50 backdrop-blur-sm rounded-2xl p-6 border border-secondary/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-text flex items-center gap-2">
          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Secure Escrow
        </h3>
        
        {session?.user?.id && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Escrow
          </button>
        )}
      </div>

      {/* Create Escrow Form */}
      {showCreateForm && (
        <div className="bg-gray-800/50 rounded-xl p-6 mb-6 border border-gray-700">
          <h4 className="text-lg font-semibold text-text mb-4">Create New Escrow</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Amount (USD)</label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={newEscrow.amount}
                onChange={(e) => setNewEscrow(prev => ({ ...prev, amount: e.target.value }))}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-primary focus:outline-none"
                placeholder="Enter amount"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Service Description</label>
              <input
                type="text"
                value={newEscrow.description}
                onChange={(e) => setNewEscrow(prev => ({ ...prev, description: e.target.value }))}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-primary focus:outline-none"
                placeholder="Brief service description"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Terms & Conditions (Optional)</label>
            <textarea
              value={newEscrow.terms}
              onChange={(e) => setNewEscrow(prev => ({ ...prev, terms: e.target.value }))}
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-primary focus:outline-none resize-none"
              rows={3}
              placeholder="Additional terms, delivery timeline, etc."
            />
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={createEscrow}
              disabled={processing === 'create'}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {processing === 'create' ? 'Creating...' : 'Create Escrow'}
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Escrow List */}
      <div className="space-y-4">
        {escrows.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="text-gray-400 mb-2">No escrow transactions yet</p>
            <p className="text-sm text-gray-500">Create an escrow to secure your payments</p>
          </div>
        ) : (
          escrows.map((escrow) => (
            <div key={escrow.id} className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-text mb-1">{escrow.description}</h4>
                  <p className="text-2xl font-bold text-primary">${escrow.amount}</p>
                </div>
                
                <div className={`px-3 py-1.5 rounded-full border text-sm font-medium ${getStatusColor(escrow.status)}`}>
                  {getStatusText(escrow.status)}
                </div>
              </div>
              
              {escrow.terms && (
                <div className="bg-gray-700/30 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-300">{escrow.terms}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-400 mb-4">
                <div>
                  <span className="font-medium">Client:</span> {escrow.client?.name || escrow.client?.email}
                </div>
                <div>
                  <span className="font-medium">Provider:</span> {escrow.provider?.name || escrow.provider?.email}
                </div>
                <div>
                  <span className="font-medium">Created:</span> {new Date(escrow.createdAt).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Updated:</span> {new Date(escrow.updatedAt).toLocaleDateString()}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {canPerformAction(escrow, 'fund') && (
                  <button
                    onClick={() => updateEscrowStatus(escrow.id, 'fund')}
                    disabled={processing === escrow.id}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    Fund Escrow
                  </button>
                )}
                
                {canPerformAction(escrow, 'start') && (
                  <button
                    onClick={() => updateEscrowStatus(escrow.id, 'start')}
                    disabled={processing === escrow.id}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    Start Service
                  </button>
                )}
                
                {canPerformAction(escrow, 'complete') && (
                  <button
                    onClick={() => updateEscrowStatus(escrow.id, 'complete')}
                    disabled={processing === escrow.id}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    Mark Complete
                  </button>
                )}
                
                {canPerformAction(escrow, 'confirm') && (
                  <button
                    onClick={() => updateEscrowStatus(escrow.id, 'confirm')}
                    disabled={processing === escrow.id}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    Confirm & Release
                  </button>
                )}
                
                {canPerformAction(escrow, 'dispute') && (
                  <button
                    onClick={() => {
                      const reason = prompt('Please describe the issue:');
                      if (reason) updateEscrowStatus(escrow.id, 'dispute', reason);
                    }}
                    disabled={processing === escrow.id}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    Open Dispute
                  </button>
                )}
                
                {canPerformAction(escrow, 'cancel') && (
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to cancel this escrow?')) {
                        updateEscrowStatus(escrow.id, 'cancel');
                      }
                    }}
                    disabled={processing === escrow.id}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
              
              {escrow.disputeReason && (
                <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-sm text-red-300">
                    <span className="font-medium">Dispute Reason:</span> {escrow.disputeReason}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      {/* Info Box */}
      <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-300">
            <p className="font-medium mb-1">How Escrow Works:</p>
            <ul className="space-y-1 text-blue-200">
              <li>• Client funds the escrow before service begins</li>
              <li>• Provider starts service once payment is secured</li>
              <li>• Client confirms satisfaction to release payment</li>
              <li>• Disputes are resolved by admin mediation</li>
              <li>• All transactions are secure and transparent</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}