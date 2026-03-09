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
  const [priceRange, setPriceRange] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
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
  const [rates, setRates] = useState([]);
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
        setPriceRange(listing.priceRange || '');
        setHourlyRate(listing.hourlyRate || '');
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
        setRates(listing.rates || []);
        setSocialLinks(listing.socialLinks || { twitter: '', instagram: '', onlyfans: '', linktree: '' });
      }
    } catch (error) {
      console.error('Error fetching listing:', error);
      setError('Error loading listing data');
    }
  };

  const bodyTypes = ['Slim', 'Athletic', 'Average', 'Curvy', 'BBW', 'Muscular', 'Petite', 'Tall'];
  const ethnicities = ['Latina', 'Brazilian', 'Mexican', 'Puerto Rican', 'Venezuelan', 'Colombian', 'Asian', 'Ebony/Black', 'Caucasian/White', 'Mixed/Exotic'];
  const serviceLocations = ['Incall', 'Outcall', 'Both'];
  const priceRanges = ['$0-100', '$100-200', '$200-300', '$300-400', '$400+'];
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

      const listingData = {
        id: listingId,
        title, bodyType, ethnicity, serviceLocation, priceRange, hourlyRate, age, availability, description, phoneArea, phoneNumber, isWhatsAppAvailable, country, state, city, neighborhood, websiteUrl, images, rates, socialLinks, userId: session.user.id
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

            <div>
              <label htmlFor="el-hourlyrate" className={LabelStyle}>Session Rate <span className="text-white/40 font-normal lowercase">(Optional)</span></label>
              <input id="el-hourlyrate" type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} className={InputStyle} placeholder="e.g., 200" />
            </div>

            <div>
              <label htmlFor="el-pricerange" className={LabelStyle}>Price Category <span className="text-red-500">*</span></label>
              <select id="el-pricerange" value={priceRange} onChange={(e) => setPriceRange(e.target.value)} className={SelectStyle} required>
                <option value="">Select Price Range</option>
                {priceRanges.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* SESSION RATES */}
        <div className="bg-[#0d0d15] rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl relative overflow-hidden group hover:border-white/20 transition-all">
          <h2 className="text-xl font-black text-white mb-6 uppercase tracking-wider border-b border-white/10 pb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-sm font-bold">3</span>
            Session Rates
          </h2>
          <div className="space-y-3 relative z-10">
            {rates.map((rate, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="text"
                  value={rate.duration}
                  onChange={(e) => {
                    const updated = [...rates];
                    updated[index] = { ...updated[index], duration: e.target.value };
                    setRates(updated);
                  }}
                  className={InputStyle}
                  placeholder="e.g., 30 min, 1 hour"
                />
                <input
                  type="text"
                  value={rate.price}
                  onChange={(e) => {
                    const updated = [...rates];
                    updated[index] = { ...updated[index], price: e.target.value };
                    setRates(updated);
                  }}
                  className={InputStyle}
                  placeholder="e.g., $200"
                />
                <button
                  type="button"
                  onClick={() => setRates(rates.filter((_, i) => i !== index))}
                  className="w-10 h-10 flex-shrink-0 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setRates([...rates, { duration: '', price: '' }])}
              className="px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-sm font-bold hover:bg-green-500/20 transition-all"
            >
              + Add Rate
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

            {/* Social Links */}
            <div className="md:col-span-2 space-y-4 pt-4 border-t border-white/10">
              <p className="text-white/50 text-xs font-bold uppercase tracking-wider">Social Links</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="el-twitter" className={LabelStyle}>Twitter / X</label>
                  <input id="el-twitter" type="text" value={socialLinks.twitter} onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })} className={InputStyle} placeholder="@handle" />
                </div>
                <div>
                  <label htmlFor="el-instagram" className={LabelStyle}>Instagram</label>
                  <input id="el-instagram" type="text" value={socialLinks.instagram} onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })} className={InputStyle} placeholder="@handle" />
                </div>
                <div>
                  <label htmlFor="el-onlyfans" className={LabelStyle}>OnlyFans</label>
                  <input id="el-onlyfans" type="text" value={socialLinks.onlyfans} onChange={(e) => setSocialLinks({ ...socialLinks, onlyfans: e.target.value })} className={InputStyle} placeholder="username" />
                </div>
                <div>
                  <label htmlFor="el-linktree" className={LabelStyle}>Linktree</label>
                  <input id="el-linktree" type="text" value={socialLinks.linktree} onChange={(e) => setSocialLinks({ ...socialLinks, linktree: e.target.value })} className={InputStyle} placeholder="username" />
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