'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import MainLayout from '@components/MainLayout';
import VerificationBadge from '../../components/VerificationBadge';

export default function VerificationManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, verified, rejected
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    fetchUsers();
  }, [session, status, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/verification');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateVerificationStatus = async (userId, status, reason = '') => {
    setProcessingId(userId);
    try {
      const response = await fetch('/api/admin/verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, status, reason }),
      });

      if (response.ok) {
        await fetchUsers(); // Refresh the list
      } else {
        alert('Error updating verification status');
      }
    } catch (error) {
      console.error('Error updating verification:', error);
      alert('Error updating verification status');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    switch (filter) {
      case 'pending':
        return user.verificationStatus === 'pending';
      case 'verified':
        return user.verified === true;
      case 'rejected':
        return user.verificationStatus === 'rejected';
      default:
        return true;
    }
  });

  const getStatusColor = (user) => {
    if (user.verified) return 'text-green-400';
    if (user.verificationStatus === 'rejected') return 'text-red-400';
    if (user.verificationStatus === 'pending') return 'text-yellow-400';
    return 'text-gray-400';
  };

  const getStatusText = (user) => {
    if (user.verified) return 'Verified';
    if (user.verificationStatus === 'rejected') return 'Rejected';
    if (user.verificationStatus === 'pending') return 'Pending Review';
    return 'Not Requested';
  };

  if (status === 'loading' || loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text">Loading verification requests...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-text mb-2">Verification Management</h1>
            <p className="text-gray-400">Manage provider verification requests and status</p>
          </div>

          {/* Filters and Search */}
          <div className="bg-dark-gray/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-secondary/20">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex gap-2">
                {['all', 'pending', 'verified', 'rejected'].map((filterOption) => (
                  <button
                    key={filterOption}
                    onClick={() => setFilter(filterOption)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      filter === filterOption
                        ? 'bg-primary text-white shadow-lg'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                  </button>
                ))}
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-700 text-white px-4 py-2 pl-10 rounded-lg border border-gray-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Users List */}
          <div className="bg-dark-gray/50 backdrop-blur-sm rounded-2xl border border-secondary/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Listings</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white font-bold">
                              {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-text flex items-center gap-2">
                              {user.name || 'No name'}
                              <VerificationBadge user={user} size="xs" showText={false} />
                            </div>
                            <div className="text-sm text-gray-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getStatusColor(user)}`}>
                          {getStatusText(user)}
                        </span>
                        {user.verificationReason && (
                          <div className="text-xs text-gray-500 mt-1">
                            {user.verificationReason}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {user._count?.listings || 0} listings
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          {!user.verified && user.verificationStatus !== 'rejected' && (
                            <button
                              onClick={() => updateVerificationStatus(user.id, 'verified')}
                              disabled={processingId === user.id}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                            >
                              {processingId === user.id ? 'Processing...' : 'Verify'}
                            </button>
                          )}
                          
                          {user.verified && (
                            <button
                              onClick={() => updateVerificationStatus(user.id, 'unverified')}
                              disabled={processingId === user.id}
                              className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                            >
                              {processingId === user.id ? 'Processing...' : 'Unverify'}
                            </button>
                          )}
                          
                          {user.verificationStatus !== 'rejected' && (
                            <button
                              onClick={() => {
                                const reason = prompt('Reason for rejection (optional):');
                                if (reason !== null) {
                                  updateVerificationStatus(user.id, 'rejected', reason);
                                }
                              }}
                              disabled={processingId === user.id}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                            >
                              {processingId === user.id ? 'Processing...' : 'Reject'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2">No users found</div>
                <p className="text-sm text-gray-500">Try adjusting your filters or search terms</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}