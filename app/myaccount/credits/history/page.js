"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function CreditsHistory() {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, purchase, spent
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalPurchased: 0,
    totalSpent: 0,
    currentBalance: 0
  });

  const itemsPerPage = 20;

  useEffect(() => {
    if (session?.user?.id) {
      fetchTransactions();
    }
  }, [session, filter, currentPage]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        userId: session.user.id,
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(filter !== 'all' && { type: filter })
      });

      const response = await fetch(`/api/credits/transactions?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();

      setTransactions(data.transactions || []);
      setTotalPages(Math.ceil((data.total || 0) / itemsPerPage));

      // Calculate stats
      const purchased = data.transactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);

      const spent = data.transactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      setStats({
        totalTransactions: data.total || 0,
        totalPurchased: purchased,
        totalSpent: spent,
        currentBalance: data.currentBalance || 0
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to load transaction history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type, description) => {
    if (type === 'purchase') {
      return (
        <div className="w-10 h-10 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/10">
          <span className="text-green-400 text-lg">💰</span>
        </div>
      );
    }

    if (description?.toLowerCase().includes('bump')) {
      return (
        <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center shadow-lg shadow-primary/10">
          <span className="text-primary text-lg">⚡</span>
        </div>
      );
    }

    if (description?.toLowerCase().includes('highlight')) {
      return (
        <div className="w-10 h-10 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/10">
          <span className="text-yellow-400 text-lg">✨</span>
        </div>
      );
    }

    if (description?.toLowerCase().includes('feature')) {
      return (
        <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/10">
          <span className="text-purple-400 text-lg">🌟</span>
        </div>
      );
    }

    if (description?.toLowerCase().includes('verification')) {
      return (
        <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/10">
          <span className="text-blue-400 text-lg">🔵</span>
        </div>
      );
    }

    return (
      <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shadow-lg">
        <span className="text-text-muted text-lg">🔄</span>
      </div>
    );
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { color: 'bg-green-500/10 text-green-400 border-green-500/20', text: 'Completed' },
      pending: { color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', text: 'Pending' },
      failed: { color: 'bg-red-500/10 text-red-400 border-red-500/20', text: 'Failed' },
      cancelled: { color: 'bg-white/5 text-text-muted border-white/10', text: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.completed;

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="flex justify-center flex-col items-center py-24 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="text-text-muted text-sm font-medium">Loading history...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card bg-red-500/10 border-red-500/20 p-6 flex flex-col items-center text-center gap-3">
        <span className="text-red-400 text-4xl">⚠️</span>
        <div>
          <h3 className="text-white font-bold text-lg mb-1">Error Loading History</h3>
          <p className="text-red-200 text-sm font-medium">{error}</p>
        </div>
        <button
          onClick={fetchTransactions}
          className="mt-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-6 py-2 rounded-xl transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] w-full space-y-6">
      {/* Header */}
      <div className="glass-card p-6 bg-gradient-to-r from-primary/10 via-background to-accent/10 border-primary/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Credits History</h1>
          <p className="text-text-muted text-sm mt-1">
            Track your purchases and credit usage
          </p>
        </div>
        <Link
          href="/myaccount/credits/buy"
          className="btn-primary py-2.5 px-6 shadow-lg shadow-primary/20 whitespace-nowrap"
        >
          Buy Credits
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 border-white/10 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/20 transition-all"></div>
          <p className="text-text-muted text-xs uppercase tracking-wider font-bold mb-1">Current Balance</p>
          <p className="text-3xl font-black text-white">{stats.currentBalance}</p>
        </div>

        <div className="glass-card p-5 border-green-500/20 bg-green-500/5 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-green-500/10 rounded-full blur-xl group-hover:bg-green-500/20 transition-all"></div>
          <p className="text-green-400/80 text-xs uppercase tracking-wider font-bold mb-1">Total Purchased</p>
          <p className="text-3xl font-black text-green-400">+{stats.totalPurchased}</p>
        </div>

        <div className="glass-card p-5 border-red-500/20 bg-red-500/5 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-red-500/10 rounded-full blur-xl group-hover:bg-red-500/20 transition-all"></div>
          <p className="text-red-400/80 text-xs uppercase tracking-wider font-bold mb-1">Total Spent</p>
          <p className="text-3xl font-black text-red-400">-{stats.totalSpent}</p>
        </div>

        <div className="glass-card p-5 border-white/10 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-all"></div>
          <p className="text-text-muted text-xs uppercase tracking-wider font-bold mb-1">Transactions</p>
          <p className="text-3xl font-black text-white">{stats.totalTransactions}</p>
        </div>
      </div>

      {/* Filters & Content */}
      <div className="glass-card overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/[0.02]">
          <div className="flex bg-background border border-white/10 rounded-xl p-1">
            <button
              onClick={() => { setFilter('all'); setCurrentPage(1); }}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${filter === 'all' ? 'bg-white/10 text-white shadow' : 'text-text-muted hover:text-white'
                }`}
            >
              All
            </button>
            <button
              onClick={() => { setFilter('purchase'); setCurrentPage(1); }}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${filter === 'purchase' ? 'bg-green-500/20 text-green-400 shadow' : 'text-text-muted hover:text-white'
                }`}
            >
              Purchases
            </button>
            <button
              onClick={() => { setFilter('spent'); setCurrentPage(1); }}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${filter === 'spent' ? 'bg-red-500/20 text-red-400 shadow' : 'text-text-muted hover:text-white'
                }`}
            >
              Spent
            </button>
          </div>
          <span className="text-xs text-text-muted font-medium bg-white/5 px-3 py-1.5 rounded-lg">
            Showing {transactions.length} items
          </span>
        </div>

        {/* Transactions List */}
        {transactions.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-3xl">👻</span>
            </div>
            <p className="text-white font-bold text-lg mb-1">No transactions found</p>
            <p className="text-text-muted text-sm">
              {filter === 'all'
                ? 'Your transaction history is completely clear.'
                : `You dont have any ${filter} transactions.`
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="p-4 hover:bg-white/[0.02] transition-colors flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {getTransactionIcon(transaction.type, transaction.description)}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-white text-sm truncate">{transaction.description}</p>
                      {transaction.status && getStatusBadge(transaction.status)}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-text-muted font-medium">
                      <span>{formatDate(transaction.createdAt)}</span>
                      {transaction.listingId && (
                        <span className="hidden sm:inline-block px-2 py-0.5 bg-white/5 rounded border border-white/5 text-[10px]">
                          ID: {transaction.listingId.substring(0, 8)}...
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className={`text-lg font-black ${transaction.type === 'purchase' ? 'text-green-400' : 'text-red-400'
                    }`}>
                    {transaction.type === 'purchase' ? '+' : '-'}{Math.abs(transaction.amount)}
                  </p>
                  <p className="text-xs text-text-muted font-medium mt-0.5">
                    Bal: {transaction.balanceAfter}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || loading}
            className="w-10 h-10 flex items-center justify-center bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50 border border-white/10"
          >
            ←
          </button>

          <div className="flex items-center gap-1 mx-2">
            <span className="text-sm font-bold text-white bg-white/10 px-4 py-2 rounded-lg border border-white/10">
              Page {currentPage} <span className="text-text-muted font-medium mx-1">of</span> {totalPages}
            </span>
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || loading}
            className="w-10 h-10 flex items-center justify-center bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50 border border-white/10"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}