'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function VerificationRequest({ user, onStatusUpdate }) {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [documents, setDocuments] = useState({
    idDocument: null,
    businessLicense: null,
    proofOfAddress: null
  });

  const handleFileChange = (type, file) => {
    setDocuments(prev => ({
      ...prev,
      [type]: file
    }));
  };

  const handleSubmitRequest = async () => {
    if (!session?.user?.id) return;
    
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('message', message);
      
      // Add files if they exist
      Object.entries(documents).forEach(([key, file]) => {
        if (file) {
          formData.append(key, file);
        }
      });

      const response = await fetch('/api/verification/request', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        onStatusUpdate?.(data.status);
        alert('Verification request submitted successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to submit verification request');
      }
    } catch (error) {
      console.error('Error submitting verification request:', error);
      alert('An error occurred while submitting your request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusDisplay = () => {
    if (user?.verified) {
      return {
        color: 'text-green-400',
        bg: 'bg-green-500/10 border-green-500/20',
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        text: 'Verified Provider',
        description: 'Your account has been verified by our team'
      };
    }
    
    if (user?.verificationStatus === 'pending') {
      return {
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/10 border-yellow-500/20',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        text: 'Verification Pending',
        description: 'Your verification request is being reviewed'
      };
    }
    
    if (user?.verificationStatus === 'rejected') {
      return {
        color: 'text-red-400',
        bg: 'bg-red-500/10 border-red-500/20',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        text: 'Verification Rejected',
        description: user?.verificationReason || 'Your verification request was not approved'
      };
    }
    
    return {
      color: 'text-gray-400',
      bg: 'bg-gray-500/10 border-gray-500/20',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      text: 'Not Verified',
      description: 'Request verification to build trust with clients'
    };
  };

  const status = getStatusDisplay();
  const canRequestVerification = !user?.verified && user?.verificationStatus !== 'pending';

  return (
    <div className="bg-dark-gray/50 backdrop-blur-sm rounded-2xl p-6 border border-secondary/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-text">Verification Status</h3>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${status.bg} ${status.color}`}>
          {status.icon}
          <span className="font-medium text-sm">{status.text}</span>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-gray-300 mb-4">{status.description}</p>
        
        {user?.verified && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-400 mb-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold">Benefits of Verification</span>
            </div>
            <ul className="text-sm text-green-300 space-y-1">
              <li>• Higher visibility in search results</li>
              <li>• Trust badge on your profile</li>
              <li>• Access to premium features</li>
              <li>• Increased client confidence</li>
            </ul>
          </div>
        )}
      </div>

      {canRequestVerification && (
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-text mb-4">Request Verification</h4>
            <p className="text-gray-400 text-sm mb-4">
              To get verified, please provide the following information and documents:
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Additional Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us about your business, experience, or any additional information..."
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                ID Document *
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileChange('idDocument', e.target.files[0])}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-primary focus:outline-none text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Driver's license, passport, or ID card</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Business License
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileChange('businessLicense', e.target.files[0])}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-primary focus:outline-none text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Business registration or license</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Proof of Address
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileChange('proofOfAddress', e.target.files[0])}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-primary focus:outline-none text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Utility bill or bank statement</p>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-300">
                <p className="font-medium mb-1">Verification Requirements:</p>
                <ul className="space-y-1 text-blue-200">
                  <li>• Valid government-issued ID is required</li>
                  <li>• All documents must be clear and readable</li>
                  <li>• Processing typically takes 1-3 business days</li>
                  <li>• We protect your privacy and secure your documents</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmitRequest}
            disabled={isSubmitting || !documents.idDocument}
            className="w-full bg-gradient-to-r from-primary to-accent text-white py-3 px-6 rounded-lg font-semibold hover:from-primary/90 hover:to-accent/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Submitting Request...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Submit Verification Request
              </>
            )}
          </button>
        </div>
      )}

      {user?.verificationStatus === 'rejected' && (
        <div className="mt-6">
          <button
            onClick={() => window.location.reload()}
            className="bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            Submit New Request
          </button>
        </div>
      )}
    </div>
  );
}