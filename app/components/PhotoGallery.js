'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function PhotoGallery({ images, initialPhotoIndex = 0, listingTitle }) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(initialPhotoIndex);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setCurrentPhotoIndex(initialPhotoIndex);
  }, [initialPhotoIndex]);

  const changePhoto = (index) => {
    if (index === currentPhotoIndex) return;
    
    setIsLoading(true);
    setCurrentPhotoIndex(index);
    
    // Update URL without page reload
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('photo', index.toString());
    window.history.pushState({}, '', newUrl);
    
    setTimeout(() => setIsLoading(false), 150);
  };

  const nextPhoto = () => {
    const newIndex = (currentPhotoIndex + 1) % images.length;
    changePhoto(newIndex);
  };

  const prevPhoto = () => {
    const newIndex = (currentPhotoIndex - 1 + images.length) % images.length;
    changePhoto(newIndex);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevPhoto();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextPhoto();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentPhotoIndex]);

  // Touch/swipe support
  useEffect(() => {
    let startX = 0;
    let endX = 0;

    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
      endX = e.changedTouches[0].clientX;
      const diff = startX - endX;

      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          nextPhoto();
        } else {
          prevPhoto();
        }
      }
    };

    const gallery = document.getElementById('photo-gallery');
    if (gallery) {
      gallery.addEventListener('touchstart', handleTouchStart);
      gallery.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        gallery.removeEventListener('touchstart', handleTouchStart);
        gallery.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [currentPhotoIndex]);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl" id="photo-gallery">
        <Image
          src={images[currentPhotoIndex]}
          alt={listingTitle}
          width={1200}
          height={600}
          unoptimized
          className={`w-full h-[500px] lg:h-[600px] object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-50' : 'opacity-100'
          }`}
        />
        
        {/* Photo Navigation Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="flex gap-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => changePhoto(idx)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    idx === currentPhotoIndex ? 'bg-accent' : 'bg-white/50 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevPhoto}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextPhoto}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>
      
      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 lg:grid-cols-6 gap-3 mt-4">
          {images.slice(0, 6).map((img, idx) => (
            <button
              key={idx}
              onClick={() => changePhoto(idx)}
              className={`relative rounded-lg overflow-hidden aspect-square cursor-pointer transition-all ${
                idx === currentPhotoIndex ? 'ring-2 ring-accent' : 'hover:opacity-80'
              }`}
            >
              <Image
                src={img}
                alt={`Photo ${idx + 1}`}
                fill
                unoptimized
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}