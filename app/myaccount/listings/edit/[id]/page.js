"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import locations from '../../../../../data/datalocations';
import ModernImageUpload from '@/components/ModernImageUpload';

export default function EditListing() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const listingId = params.id;

  const [title, setTitle] = useState('');
  const [bodyType, setBodyType] = useState('');
  const [ethnicity, setEthnicity] = useState('');
  const [serviceLocation, setServiceLocation] = useState('');
  const [age, setAge] = useState('');
  const [availability, setAvailability] = useState('');
  const [description, setDescription] = useState('');
  const [phoneArea, setPhoneArea] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isWhatsAppAvailable, setIsWhatsAppAvailable] = useState(false);
  const [country, setCountry] = useState('United States');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [images, setImages] = useState([]);
  const [rates, setRates] = useState([{ duration: '1 hour', price: '' }]);
  const [socialLinks, setSocialLinks] = useState({ twitter: '', instagram: '', onlyfans: '', linktree: '' });
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [session, status, router]);

  useEffect(() => {
    if (listingId && session?.user?.id) {
      fetchListingData();
    }
  }, [listingId, session]);

  const fetchListingData = async () => {
    try {
      const response = await fetch(`/api/listings/${listingId}`);
      if (response.ok) {
        const data = await response.json();
        const listing = data.listing || data;

        // Prevent editing others' listings
        if (listing.userId !== session.user.id) {
          router.push('/myaccount/listings');
          return;
        }

        setTitle(listing.title || '');
        setBodyType(listing.bodyType || '');
        setEthnicity(listing.ethnicity || '');
        setServiceLocation(listing.serviceLocation || '');
        setAge(listing.age || '');
        setAvailability(listing.availability || '');
        setDescription(listing.description || '');
        setPhoneArea(listing.phoneArea || '');
        setPhoneNumber(listing.phoneNumber || '');
        setIsWhatsAppAvailable(listing.isWhatsAppAvailable || false);
        setCountry(listing.country || 'United States');
        setState(listing.state || '');
        setCity(listing.city || '');
        setNeighborhood(listing.neighborhood || '');
        setWebsiteUrl(listing.websiteUrl || '');
        setImages(listing.images || []);
        setRates(listing.rates?.length ? listing.rates : [{ duration: '1 hour', price: '' }]);
        // Strip full URLs to usernames for display in prefixed inputs
        const rawSocial = listing.socialLinks || { twitter: '', instagram: '', onlyfans: '', linktree: '' };
        setSocialLinks({
          twitter: (rawSocial.twitter || '').replace(/^(https?:\/\/)?(www\.)?(x\.com|twitter\.com)\/?/i, ''),
          instagram: (rawSocial.instagram || '').replace(/^(https?:\/\/)?(www\.)?instagram\.com\/?/i, ''),
          onlyfans: (rawSocial.onlyfans || '').replace(/^(https?:\/\/)?(www\.)?onlyfans\.com\/?/i, ''),
          linktree: (rawSocial.linktree || '').replace(/^(https?:\/\/)?(www\.)?linktr\.ee\/?/i, ''),
        });
      }
    } catch (error) {
      console.error('Error fetching listing:', error);
      setError('Error loading listing data');
    }
  };

  const bodyTypes = ['Slim', 'Athletic', 'Average', 'Curvy', 'BBW', 'Muscular', 'Petite', 'Tall'];
  const ethnicities = ['Latina', 'Brazilian', 'Mexican', 'Puerto Rican', 'Venezuelan', 'Colombian', 'Asian', 'Ebony/Black', 'Caucasian/White', 'Mixed/Exotic'];
  const serviceLocations = ['Incall', 'Outcall', 'Both'];
  const durationOptions = ['15min', '30min', '45min', '1 hour', '1.5 hours', '2 hours', '3 hours'];

  const addRate = () => {
    setRates(prev => [...prev, { duration: '1 hour', price: '' }]);
  };

  const removeRate = (index) => {
    setRates(prev => prev.filter((_, i) => i !== index));
  };

  const updateRate = (index, field, value) => {
    setRates(prev => prev.map((rate, i) => i === index ? { ...rate, [field]: value } : rate));
  };

  const titleHasVerified = /\bverified\b/i.test(title);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (titleHasVerified) {
        setError('The word "Verified" is not allowed in your title. Only staff-verified accounts receive the Verified badge.');
        setLoading(false);
        return;
      }

      if (age && parseInt(age) < 21) {
        setError('You must be at least 21 years old to edit a listing.');
        setLoading(false);
        return;
      }

      // Auto-derive hourlyRate and priceRange from Session Rates table
      const firstPrice = Number(rates[0]?.price) || 0;
      const autoHourlyRate = firstPrice || '';
      const autoPriceRange = firstPrice <= 100 ? '$0-100'
        : firstPrice <= 200 ? '$100-200'
        : firstPrice <= 300 ? '$200-300'
        : firstPrice <= 400 ? '$300-400'
        : '$400+';

      // Build full URLs from usernames for social links
      const fullSocialLinks = {
        twitter: socialLinks.twitter ? `https://x.com/${socialLinks.twitter.replace(/^\//, '')}` : '',
        instagram: socialLinks.instagram ? `https://instagram.com/${socialLinks.instagram.replace(/^\//, '')}` : '',
        onlyfans: socialLinks.onlyfans ? `https://onlyfans.com/${socialLinks.onlyfans.replace(/^\//, '')}` : '',
        linktree: socialLinks.linktree ? `https://linktr.ee/${socialLinks.linktree.replace(/^\//, '')}` : '',
      };

      const listingData = {
        id: listingId,
        title, bodyType, ethnicity, serviceLocation, priceRange: autoPriceRange, hourlyRate: autoHourlyRate, age, availability, description, phoneArea, phoneNumber, isWhatsAppAvailable, country, state, city, neighborhood, websiteUrl, images, rates, socialLinks: fullSocialLinks, userId: session.user.id
      };

      const response = await fetch(`/api/listing`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listingData)
      });

      if (response.ok) {
        setSuccess('Listing updated successfully!');
        setTimeout(() => router.push('/myaccount/listings'), 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update listing');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while saving the listing');
    } finally {
      setLoading(false);
    }
  };

  const processFiles = async (files) => {
    if (!files || files.length === 0) return;
    if (images.length + files.length > 5) {
      setError('You can upload a maximum of 5 images');
      return;
    }

    setError('');
    setIsUploading(true);

    try {
      const formData = new FormData();
      files.forEach(file => formData.append('images', file));

      if (listingId) {
        formData.append('listingId', listingId);
      }

      const response = await fetch('/api/upload/images', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setImages(prev => [...(Array.isArray(prev) ? prev : []), ...data.images]);
        setSuccess('Images uploaded successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to upload images');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('An error occurred while uploading images');
    } finally {
      setIsUploading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center">
        <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-primary animate-spin mb-4" />
        <p className="text-white/40 animate-pulse font-medium">Buscando detalhes...</p>
      </div>
    );
  }
  if (status === 'unauthenticated') return null;

  const InputStyle = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-medium";
  const SelectStyle = "w-full bg-[#12121f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-medium";
  const LabelStyle = "block text-white/70 text-sm font-bold uppercase tracking-wider mb-2";

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header Profile Info */}
      <div className="bg-[#0d0d15] rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="flex items-center gap-6 z-10 w-full">
          <div className="w-20 h-20 bg-gradient-to-tr from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg border border-white/10 shrink-0">
            <svg className="w-8 h-8 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-black text-white leading-tight mb-2">
              Edit Listing
            </h1>
            <p className="text-white/50 text-sm font-medium">
              Update your listing details, photos, and ensure you stay at the top.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-6 py-4 rounded-2xl font-medium animate-shake flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-6 py-4 rounded-2xl font-medium animate-fade-in flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* MEDIA GALLERY UPLOAD */}
        <div className="bg-[#0d0d15] rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl relative overflow-hidden group hover:border-white/20 transition-all">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-accent/10 transition-all" />
          <h2 className="text-xl font-black text-white mb-6 uppercase tracking-wider border-b border-white/10 pb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center text-sm font-bold">1</span>
            Media Gallery
          </h2>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 mb-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            <div>
              <p className="text-amber-400 text-xs font-bold mb-1">Photo Guidelines</p>
              <ul className="text-amber-400/70 text-xs space-y-0.5 list-disc list-inside">
                <li>No explicit, nude, or sexually suggestive photos</li>
                <li>No photos showing illegal activity or substances</li>
                <li>Only upload photos of yourself — no stock images</li>
                <li>Listings with inappropriate photos will be removed without refund</li>
              </ul>
            </div>
          </div>
          <ModernImageUpload
            images={images}
            onImagesChange={setImages}
            onImageUpload={processFiles}
            maxImages={5}
            isUploading={isUploading}
          />
        </div>

        {/* BASIC INFORMATION */}
        <div className="bg-[#0d0d15] rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl relative overflow-hidden group hover:border-white/20 transition-all">
          <h2 className="text-xl font-black text-white mb-6 uppercase tracking-wider border-b border-white/10 pb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">2</span>
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div className="md:col-span-2">
              <label htmlFor="el-title" className={LabelStyle}>Headline Title <span className="text-red-500">*</span></label>
              <input id="el-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={`${InputStyle} ${titleHasVerified ? 'border-red-500/70 ring-1 ring-red-500/50 focus:border-red-500/70 focus:ring-red-500/50' : ''}`} required placeholder="e.g., Ultimate Relaxation Experience" />
              {titleHasVerified ? (
                <p className="text-red-400 text-[11px] mt-1.5 flex items-center gap-1.5 font-bold animate-pulse">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  The word "Verified" is not allowed. Remove it to publish your listing.
                </p>
              ) : (
                <p className="text-red-400/70 text-[11px] mt-1.5 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  Using the word "Verified" in your title will result in deletion of your ad. Only staff-verified accounts receive the Verified badge.
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="el-description" className={LabelStyle}>Description <span className="text-red-500">*</span></label>
              <textarea id="el-description" value={description} onChange={(e) => { if (e.target.value.length <= 3000) setDescription(e.target.value); }} maxLength={3000} className={`${InputStyle} h-32 resize-none`} required placeholder="Describe your service in detail..." />
              <div className="flex items-center justify-between mt-1.5">
                <p className="text-white/30 text-[11px] flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                  Do not include explicit or sexual content, phone numbers, or links in your description. Keep it professional and focused on the services you offer.
                </p>
                <span className={`text-[11px] shrink-0 ml-3 ${description.length > 2800 ? 'text-amber-400' : 'text-white/30'}`}>{3000 - description.length} characters left</span>
              </div>
            </div>

            <div>
              <label htmlFor="el-age" className={LabelStyle}>Age <span className="text-red-500">*</span></label>
              <input id="el-age" type="number" min="21" value={age} onChange={(e) => setAge(e.target.value)} className={InputStyle} required placeholder="21+" />
            </div>

            <div>
              <label htmlFor="el-ethnicity" className={LabelStyle}>Ethnicity <span className="text-red-500">*</span></label>
              <select id="el-ethnicity" value={ethnicity} onChange={(e) => setEthnicity(e.target.value)} className={SelectStyle} required>
                <option value="">Select Ethnicity</option>
                {ethnicities.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="el-bodytype" className={LabelStyle}>Body Type <span className="text-red-500">*</span></label>
              <select id="el-bodytype" value={bodyType} onChange={(e) => setBodyType(e.target.value)} className={SelectStyle} required>
                <option value="">Select Body Type</option>
                {bodyTypes.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="el-service" className={LabelStyle}>Service Types <span className="text-red-500">*</span></label>
              <select id="el-service" value={serviceLocation} onChange={(e) => setServiceLocation(e.target.value)} className={SelectStyle} required>
                <option value="">Select Service</option>
                {serviceLocations.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

          </div>
        </div>

        {/* SESSION RATES */}
        <div className="bg-[#0d0d15] rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl relative overflow-hidden group hover:border-white/20 transition-all">
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none group-hover:bg-yellow-500/10 transition-all" />
          <h2 className="text-xl font-black text-white mb-6 uppercase tracking-wider border-b border-white/10 pb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center text-sm font-bold">3</span>
            Session Rates
          </h2>

          <div className="space-y-3 relative z-10">
            {/* Table Header */}
            <div className="grid grid-cols-[1fr_1fr_auto] gap-4 px-2">
              <span className={LabelStyle}>Duration</span>
              <span className={LabelStyle}>Price (USD)</span>
              <span className="w-10" />
            </div>

            {/* Rate Rows */}
            {rates.map((rate, index) => (
              <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-4 items-center">
                <select
                  id={`el-rate-duration-${index}`}
                  name={`rate-duration-${index}`}
                  value={rate.duration}
                  onChange={(e) => updateRate(index, 'duration', e.target.value)}
                  className={SelectStyle}
                >
                  {durationOptions.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold text-sm">$</span>
                  <input
                    id={`el-rate-price-${index}`}
                    name={`rate-price-${index}`}
                    type="number"
                    min="0"
                    value={rate.price}
                    onChange={(e) => updateRate(index, 'price', e.target.value)}
                    className={`${InputStyle} pl-8`}
                    placeholder="0"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeRate(index)}
                  disabled={rates.length === 1}
                  className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                </button>
              </div>
            ))}

            {/* Add Row Button */}
            <button
              type="button"
              onClick={addRate}
              className="flex items-center gap-2 px-5 py-3 mt-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all text-sm font-bold uppercase tracking-wider"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add Rate
            </button>
          </div>
        </div>

        {/* LOCATION & CONTACT */}
        <div className="bg-[#0d0d15] rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl relative overflow-hidden group hover:border-white/20 transition-all">
          <h2 className="text-xl font-black text-white mb-6 uppercase tracking-wider border-b border-white/10 pb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold">4</span>
            Location & Contact
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div>
              <label htmlFor="el-state" className={LabelStyle}>State/Province <span className="text-red-500">*</span></label>
              <select id="el-state" value={state} onChange={(e) => setState(e.target.value)} className={SelectStyle} required>
                <option value="">Select a state</option>
                {locations.map(loc => <option key={loc.state} value={loc.state}>{loc.state}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="el-city" className={LabelStyle}>City <span className="text-red-500">*</span></label>
              <select id="el-city" value={city} onChange={(e) => setCity(e.target.value)} className={SelectStyle} required disabled={!state}>
                <option value="">Select a city</option>
                {state && locations.find(loc => loc.state === state)?.cities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="el-neighborhood" className={LabelStyle}>Neighborhood</label>
              <input id="el-neighborhood" type="text" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} className={InputStyle} placeholder="Enter neighborhood" />
            </div>

            <div className="flex gap-4">
              <div className="w-1/3">
                <label htmlFor="el-phonearea" className={LabelStyle}>Area <span className="text-red-500">*</span></label>
                <input id="el-phonearea" type="text" value={phoneArea} onChange={(e) => setPhoneArea(e.target.value)} className={InputStyle} required placeholder="305" maxLength="4" />
              </div>
              <div className="w-2/3">
                <label htmlFor="el-phone" className={LabelStyle}>Phone Number <span className="text-red-500">*</span></label>
                <input id="el-phone" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className={InputStyle} required placeholder="1234567" />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center space-x-3 cursor-pointer bg-white/5 p-4 rounded-xl border border-white/10 hover:border-green-500/50 transition-all">
                <input type="checkbox" checked={isWhatsAppAvailable} onChange={(e) => setIsWhatsAppAvailable(e.target.checked)} className="w-5 h-5 rounded border-white/20 text-green-500 focus:ring-green-500/50 bg-black/50" />
                <span className="text-white font-medium flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>
                  Available on WhatsApp
                </span>
              </label>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="el-website" className={LabelStyle}>Website URL</label>
              <input id="el-website" type="text" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} className={InputStyle} placeholder="www.yourwebsite.com" />
            </div>

            {/* SOCIAL LINKS */}
            <div className="md:col-span-2 border-t border-white/10 pt-6 mt-2">
              <h3 className="text-sm font-black text-white/60 uppercase tracking-wider mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                Social Links
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="el-twitter" className={LabelStyle}>
                    <span className="inline-flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      Twitter / X
                    </span>
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 bg-white/5 border border-r-0 border-white/10 rounded-l-xl text-white/40 text-sm font-medium">x.com/</span>
                    <input id="el-twitter" type="text" value={socialLinks.twitter} onChange={(e) => setSocialLinks(prev => ({ ...prev, twitter: e.target.value.replace(/^(https?:\/\/)?(www\.)?(x\.com|twitter\.com)\/?/i, '') }))} className={`${InputStyle} rounded-l-none`} placeholder="username" />
                  </div>
                </div>
                <div>
                  <label htmlFor="el-instagram" className={LabelStyle}>
                    <span className="inline-flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                      Instagram
                    </span>
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 bg-white/5 border border-r-0 border-white/10 rounded-l-xl text-white/40 text-sm font-medium">instagram.com/</span>
                    <input id="el-instagram" type="text" value={socialLinks.instagram} onChange={(e) => setSocialLinks(prev => ({ ...prev, instagram: e.target.value.replace(/^(https?:\/\/)?(www\.)?instagram\.com\/?/i, '') }))} className={`${InputStyle} rounded-l-none`} placeholder="username" />
                  </div>
                </div>
                <div>
                  <label htmlFor="el-onlyfans" className={LabelStyle}>
                    <span className="inline-flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12c0 6.627 5.373 12 12 12s12-5.373 12-12C24 5.373 18.627 0 12 0zm0 4.5c1.657 0 3 1.567 3 3.5 0 .766-.278 1.467-.736 2.02C15.36 11.076 16.5 12.708 16.5 14.625c0 2.485-2.015 4.5-4.5 4.5s-4.5-2.015-4.5-4.5c0-1.917 1.14-3.549 2.236-4.605A3.489 3.489 0 019 8c0-1.933 1.343-3.5 3-3.5z"/></svg>
                      OnlyFans
                    </span>
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 bg-white/5 border border-r-0 border-white/10 rounded-l-xl text-white/40 text-sm font-medium">onlyfans.com/</span>
                    <input id="el-onlyfans" type="text" value={socialLinks.onlyfans} onChange={(e) => setSocialLinks(prev => ({ ...prev, onlyfans: e.target.value.replace(/^(https?:\/\/)?(www\.)?onlyfans\.com\/?/i, '') }))} className={`${InputStyle} rounded-l-none`} placeholder="username" />
                  </div>
                </div>
                <div>
                  <label htmlFor="el-linktree" className={LabelStyle}>
                    <span className="inline-flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M7.953 15.066c-.08.163-.08.324-.08.486.08 1.461.962 2.678 2.246 3.245a3.263 3.263 0 01-1.445.405c-.324 0-.567-.08-.891-.08.891 2.76 3.458 4.79 6.432 4.87-2.327 1.86-5.302 2.922-8.44 2.922-.567 0-1.053-.08-1.54-.162C7.14 28.834 10.6 30 14.302 30c10.2 0 15.826-8.603 15.826-16.072 0-.243 0-.486-.08-.729a11.3 11.3 0 002.836-2.922c-.972.486-2.085.81-3.218.891a5.698 5.698 0 002.489-3.164 10.56 10.56 0 01-3.539 1.375A5.559 5.559 0 0024.553 7.5c-3.137 0-5.626 2.597-5.626 5.74 0 .405.08.891.162 1.296-4.656-.243-8.843-2.516-11.61-5.982-.487.891-.73 1.862-.73 2.922 0 1.942.972 3.723 2.489 4.776-.891-.08-1.783-.243-2.489-.648v.08c0 2.76 1.944 5.09 4.514 5.576a5.277 5.277 0 01-1.458.162c-.406 0-.73 0-1.134-.08.81 2.435 3.055 4.216 5.786 4.297-2.085 1.7-4.757 2.678-7.634 2.678-.486 0-.972-.08-1.458-.08 2.73 1.78 5.948 2.76 9.407 2.76M7.5 2.25A3.75 3.75 0 1011.25 6 3.75 3.75 0 007.5 2.25zm0 6A2.25 2.25 0 119.75 6 2.25 2.25 0 017.5 8.25zm9 6A3.75 3.75 0 1020.25 18 3.75 3.75 0 0016.5 14.25zm0 6A2.25 2.25 0 1118.75 18a2.25 2.25 0 01-2.25 2.25z" /><path d="M19.5 2.25h-15A2.25 2.25 0 002.25 4.5v15a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25v-15a2.25 2.25 0 00-2.25-2.25zm-9 15.75L6 13.5l1.5-1.5 3 3 6-6 1.5 1.5z"/></svg>
                      Linktree
                    </span>
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 bg-white/5 border border-r-0 border-white/10 rounded-l-xl text-white/40 text-sm font-medium">linktr.ee/</span>
                    <input id="el-linktree" type="text" value={socialLinks.linktree} onChange={(e) => setSocialLinks(prev => ({ ...prev, linktree: e.target.value.replace(/^(https?:\/\/)?(www\.)?linktr\.ee\/?/i, '') }))} className={`${InputStyle} rounded-l-none`} placeholder="username" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SUBMIT ACTIONS */}
        <div className="bg-[#0d0d15] rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-white/50 text-sm font-medium flex-1 text-center sm:text-left">
            By clicking "Save Changes", you agree to our Terms of Service and confirm all information applies to our community guidelines.
          </p>
          <div className="flex w-full sm:w-auto items-center gap-4">
            <Link href="/myaccount/listings" className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all text-center flex-1 sm:flex-none">
              Cancel
            </Link>
            <button type="submit" disabled={loading} className="px-8 py-4 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-xl hover:shadow-[0_0_30px_rgba(255,42,127,0.4)] hover:scale-[1.02] transition-all disabled:opacity-50 text-center flex-1 sm:flex-none uppercase tracking-widest text-sm">
              {loading ? 'Processing...' : 'Save Changes'}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
