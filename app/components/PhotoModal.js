'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Zoom, Keyboard, Mousewheel, EffectFade, Thumbs, FreeMode } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/zoom';
import 'swiper/css/effect-fade';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';

const PhotoModal = ({ images, isOpen, onClose, initialIndex = 0, listingTitle }) => {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const mainSwiperRef = useRef(null);
  const modalRef = useRef(null);

  // Preparar as imagens
  const processedImages = images?.map((image, index) => {
    const imageSrc = image.url || image.src || image;
    const finalSrc = imageSrc?.startsWith('http') || imageSrc?.startsWith('/api/') ? imageSrc : `/api/images/${imageSrc}`;
    
    return {
      src: finalSrc,
      alt: image.alt || `${listingTitle} - Foto ${index + 1}`,
      title: image.title || `${listingTitle} - Foto ${index + 1}`
    };
  }) || [];

  // Fechar modal com ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 300);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Ir para slide inicial
  useEffect(() => {
    if (isOpen && mainSwiperRef.current && initialIndex !== currentIndex) {
      mainSwiperRef.current.slideTo(initialIndex);
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  if (!isOpen || !images || images.length === 0) {
    return null;
  }

  const handleSlideChange = (swiper) => {
    setCurrentIndex(swiper.activeIndex);
    setIsZoomed(false);
  };

  const handleZoomChange = (swiper, scale) => {
    setIsZoomed(scale > 1);
  };

  const handleBackdropClick = (e) => {
    if (e.target === modalRef.current && !isZoomed) {
      onClose();
    }
  };

  return (
    <div 
      ref={modalRef}
      className={`photo-modal-overlay ${isLoading ? 'loading' : 'loaded'}`}
      onClick={handleBackdropClick}
    >
      {/* Header com título e botão fechar */}
      <div className="photo-modal-header">
        <div className="photo-modal-title">
          <h3>{listingTitle}</h3>
          <span className="photo-counter">
            {currentIndex + 1} de {processedImages.length}
          </span>
        </div>
        <button 
          className="photo-modal-close"
          onClick={onClose}
          aria-label="Fechar galeria"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Swiper principal */}
      <div className="photo-modal-main">
        <Swiper
          onSwiper={(swiper) => {
            mainSwiperRef.current = swiper;
          }}
          modules={[Navigation, Pagination, Zoom, Keyboard, Mousewheel, EffectFade, Thumbs]}
          spaceBetween={0}
          slidesPerView={1}
          navigation={{
            nextEl: '.photo-modal-next',
            prevEl: '.photo-modal-prev',
          }}
          pagination={{
            el: '.photo-modal-pagination',
            type: 'fraction',
            formatFractionCurrent: (number) => number,
            formatFractionTotal: (number) => number,
          }}
          zoom={{
            maxRatio: 4,
            minRatio: 1,
            toggle: true,
            containerClass: 'swiper-zoom-container',
          }}
          keyboard={{
            enabled: true,
            onlyInViewport: false,
          }}
          mousewheel={{
            thresholdDelta: 50,
            sensitivity: 1,
          }}
          thumbs={{
            swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
          }}
          initialSlide={initialIndex}
          onSlideChange={handleSlideChange}
          onZoomChange={handleZoomChange}
          className="photo-modal-swiper"
        >
          {processedImages.map((image, index) => (
            <SwiperSlide key={index} className="photo-modal-slide">
              <div className="swiper-zoom-container">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="photo-modal-image"
                  loading={index === initialIndex ? 'eager' : 'lazy'}
                  onLoad={() => {
                    if (index === initialIndex) {
                      setIsLoading(false);
                    }
                  }}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navegação customizada */}
        <button className="photo-modal-nav photo-modal-prev" aria-label="Foto anterior">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button className="photo-modal-nav photo-modal-next" aria-label="Próxima foto">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Thumbnails — hidden on mobile to avoid "double photo" appearance */}
      {processedImages.length > 1 && (
        <div className="photo-modal-thumbs">
          <Swiper
            onSwiper={setThumbsSwiper}
            modules={[FreeMode, Navigation, Thumbs]}
            spaceBetween={12}
            slidesPerView="auto"
            freeMode={true}
            watchSlidesProgress={true}
            className="photo-modal-thumbs-swiper"
            centeredSlides={true}
            centeredSlidesBounds={true}
          >
            {processedImages.map((image, index) => (
              <SwiperSlide key={index} className="photo-modal-thumb">
                <img
                  src={image.src}
                  alt={image.alt}
                  className={`photo-modal-thumb-image ${index === currentIndex ? 'active' : ''}`}
                  loading="lazy"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      {/* Loading spinner */}
      {isLoading && (
        <div className="photo-modal-loading">
          <div className="spinner"></div>
        </div>
      )}

      {/* Zoom indicator */}
      {isZoomed && (
        <div className="photo-modal-zoom-indicator">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M11 8V14M8 11H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span>Clique duas vezes para zoom</span>
        </div>
      )}

      <style jsx>{`
        .photo-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(20px);
          z-index: 10000;
          display: flex;
          flex-direction: column;
          opacity: 0;
          transform: scale(0.95);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .photo-modal-overlay.loaded {
          opacity: 1;
          transform: scale(1);
        }

        .photo-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 32px;
          background: linear-gradient(180deg, rgba(0, 0, 0, 0.8) 0%, transparent 100%);
          position: relative;
          z-index: 10;
        }

        .photo-modal-title h3 {
          color: white;
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 4px 0;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
        }

        .photo-counter {
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
          font-weight: 500;
        }

        .photo-modal-close {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          color: white;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .photo-modal-close:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.05);
        }

        .photo-modal-main {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 80px;
        }

        .photo-modal-swiper {
          width: 100%;
          height: 100%;
          max-height: calc(100vh - 200px);
        }

        .photo-modal-slide {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .photo-modal-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          border-radius: 12px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
          transition: all 0.3s ease;
        }

        .photo-modal-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          color: white;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          z-index: 10;
        }

        .photo-modal-nav:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-50%) scale(1.1);
        }

        .photo-modal-prev {
          left: 24px;
        }

        .photo-modal-next {
          right: 24px;
        }

        .photo-modal-thumbs {
          padding: 24px 32px;
          background: linear-gradient(0deg, rgba(0, 0, 0, 0.8) 0%, transparent 100%);
        }

        .photo-modal-thumbs-swiper {
          width: 100%;
          height: 80px;
        }

        .photo-modal-thumb {
          width: 80px !important;
          height: 80px;
          cursor: pointer;
        }

        .photo-modal-thumb-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 8px;
          border: 2px solid transparent;
          transition: all 0.3s ease;
          opacity: 0.6;
        }

        .photo-modal-thumb-image:hover {
          opacity: 0.8;
          transform: scale(1.05);
        }

        .photo-modal-thumb-image.active {
          opacity: 1;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
        }

        .photo-modal-loading {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 20;
        }

        .spinner {
          width: 48px;
          height: 48px;
          border: 3px solid rgba(255, 255, 255, 0.2);
          border-top: 3px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .photo-modal-zoom-indicator {
          position: absolute;
          bottom: 120px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 12px 20px;
          border-radius: 25px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          animation: fadeInUp 0.3s ease;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        /* Responsividade */
        @media (max-width: 768px) {
          .photo-modal-thumbs {
            display: none;
          }

          .photo-modal-header {
            padding: 16px 20px;
          }

          .photo-modal-title h3 {
            font-size: 18px;
          }

          .photo-modal-main {
            padding: 0 60px;
          }

          .photo-modal-nav {
            width: 48px;
            height: 48px;
          }

          .photo-modal-prev {
            left: 16px;
          }

          .photo-modal-next {
            right: 16px;
          }

          .photo-modal-thumbs {
            padding: 16px 20px;
          }

          .photo-modal-thumb {
            width: 60px !important;
            height: 60px;
          }

          .photo-modal-thumbs-swiper {
            height: 60px;
          }
        }

        @media (max-width: 480px) {
          .photo-modal-main {
            padding: 0 20px;
          }

          .photo-modal-nav {
            width: 40px;
            height: 40px;
          }

          .photo-modal-prev {
            left: 8px;
          }

          .photo-modal-next {
            right: 8px;
          }
        }

        /* Swiper overrides */
        :global(.photo-modal-swiper .swiper-zoom-container) {
          cursor: grab;
        }

        :global(.photo-modal-swiper .swiper-zoom-container:active) {
          cursor: grabbing;
        }

        :global(.photo-modal-swiper .swiper-slide-zoomed .swiper-zoom-container) {
          cursor: move;
        }
      `}</style>
    </div>
  );
};

export default PhotoModal;