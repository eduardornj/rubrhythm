'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function RubRhythmCreditsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [credits, setCredits] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    fetchCredits();
  }, [session, status, router]);

  const fetchCredits = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/credits');
      if (response.ok) {
        const data = await response.json();
        setCredits(data.credits || 0);
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      setLoading(false);
    }
  };

  const creditPackages = [
    { id: 1, credits: 100, price: 9.99, popular: false },
    { id: 2, credits: 250, price: 19.99, popular: true },
    { id: 3, credits: 500, price: 34.99, popular: false },
    { id: 4, credits: 1000, price: 59.99, popular: false }
  ];

  const handlePurchase = async (packageId) => {
    try {
      const response = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ packageId })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.paymentUrl) {
          window.location.href = data.paymentUrl;
        }
      }
    } catch (error) {
      console.error('Error purchasing credits:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-text mb-4">RubRhythm Credits</h1>
            <p className="text-muted text-lg mb-6">
              Purchase credits to boost your listings and get more visibility
            </p>
            <div className="bg-surface rounded-lg border border-border p-6 inline-block">
              <div className="text-3xl font-bold text-primary mb-2">{credits}</div>
              <div className="text-muted">Current Credits</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {creditPackages.map((pkg) => (
              <div
                key={pkg.id}
                className={`bg-surface rounded-lg border-2 p-6 text-center relative ${
                  pkg.popular ? 'border-primary' : 'border-border'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="mb-4">
                  <div className="text-3xl font-bold text-text mb-2">{pkg.credits}</div>
                  <div className="text-muted">Credits</div>
                </div>
                
                <div className="mb-6">
                  <div className="text-2xl font-bold text-primary">${pkg.price}</div>
                  <div className="text-muted text-sm">
                    ${(pkg.price / pkg.credits).toFixed(3)} per credit
                  </div>
                </div>
                
                <button
                  onClick={() => handlePurchase(pkg.id)}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    pkg.popular
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'bg-background border border-border text-text hover:bg-border'
                  }`}
                >
                  Purchase
                </button>
              </div>
            ))}
          </div>

          {transactions.length > 0 && (
            <div className="bg-surface rounded-lg border border-border p-6">
              <h2 className="text-2xl font-bold text-text mb-6">Transaction History</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-text font-medium">Date</th>
                      <th className="text-left py-3 px-4 text-text font-medium">Type</th>
                      <th className="text-left py-3 px-4 text-text font-medium">Credits</th>
                      <th className="text-left py-3 px-4 text-text font-medium">Amount</th>
                      <th className="text-left py-3 px-4 text-text font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b border-border">
                        <td className="py-3 px-4 text-muted">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-text">{transaction.type}</td>
                        <td className="py-3 px-4 text-text">
                          {transaction.type === 'purchase' ? '+' : '-'}{transaction.credits}
                        </td>
                        <td className="py-3 px-4 text-text">
                          {transaction.amount ? `$${transaction.amount}` : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              transaction.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : transaction.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}