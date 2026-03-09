"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function TipSystem({ providerId, listingTitle }) {
  const [tips, setTips] = useState([]);
  const [showTipForm, setShowTipForm] = useState(false);
  const [newTip, setNewTip] = useState({
    amount: '',
    message: ''
  });
  const [processing, setProcessing] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.id) {
      fetchTips();
    }
  }, [session]);

  const fetchTips = async () => {
    try {
      const response = await fetch('/api/tips');
      if (response.ok) {
        const data = await response.json();
        setTips(data.tips || []);
      }
    } catch (error) {
      console.error('Error fetching tips:', error);
    }
  };

  const sendTip = async () => {
    if (!newTip.amount || parseFloat(newTip.amount) <= 0) {
      alert('Please enter a valid tip amount');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch('/api/tips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          providerId,
          amount: parseFloat(newTip.amount),
          message: newTip.message,
          listingTitle
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTips(prev => [data.tip, ...prev]);
        setNewTip({ amount: '', message: '' });
        setShowTipForm(false);
        alert('Tip sent successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to send tip');
      }
    } catch (error) {
      console.error('Error sending tip:', error);
      alert('Failed to send tip. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!session?.user?.id) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <p className="text-gray-400 mb-4">Please log in to send tips</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Send a Tip</h2>
          <p className="text-sm text-gray-400">
            Show your appreciation with a tip. This is completely optional and separate from any service payment.
          </p>
        </div>
        {!showTipForm && (
          <button
            onClick={() => setShowTipForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Send Tip
          </button>
        )}
      </div>

      {/* Important Notice */}
      <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="text-yellow-500 font-medium mb-1">Important Notice</h3>
            <p className="text-yellow-200 text-sm">
              Tips are voluntary appreciation payments and are NOT part of any service agreement. 
              All service arrangements and payments should be handled directly between you and the provider.
            </p>
          </div>
        </div>
      </div>

      {/* Tip Form */}
      {showTipForm && (
        <div className="bg-gray-700 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Send a Tip</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tip Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={newTip.amount}
                onChange={(e) => setNewTip(prev => ({ ...prev, amount: e.target.value }))}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg border border-gray-500 focus:border-green-500 focus:outline-none"
                placeholder="Enter tip amount"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Message (Optional)</label>
              <input
                type="text"
                value={newTip.message}
                onChange={(e) => setNewTip(prev => ({ ...prev, message: e.target.value }))}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg border border-gray-500 focus:border-green-500 focus:outline-none"
                placeholder="Thank you message"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={sendTip}
              disabled={processing}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {processing ? 'Sending...' : 'Send Tip'}
            </button>
            <button
              onClick={() => setShowTipForm(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Tips History */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Recent Tips</h3>
        {tips.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <p className="text-gray-400 mb-2">No tips sent yet</p>
            <p className="text-sm text-gray-500">Send your first tip to show appreciation</p>
          </div>
        ) : (
          tips.map((tip) => (
            <div key={tip.id} className="bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-white font-medium">${tip.amount.toFixed(2)} tip</p>
                  <p className="text-sm text-gray-400">{formatDate(tip.createdAt)}</p>
                </div>
                <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                  Sent
                </span>
              </div>
              {tip.message && (
                <p className="text-gray-300 text-sm mt-2 italic">"{tip.message}"</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}