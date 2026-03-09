"use client";
import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Componente de imagem individual com drag and drop
function SortableImageItem({ id, image, index, onRemove, isMainPhoto }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group cursor-move rounded-2xl overflow-hidden shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300 border ${isDragging ? 'scale-105 rotate-3 border-primary/50 z-50 shadow-[0_0_30px_rgba(255,42,127,0.3)]' : 'border-white/10'
        } ${isMainPhoto ? 'ring-2 ring-primary ring-offset-2 ring-offset-[#0d0d15] border-primary/50' : ''
        }`}
      {...attributes}
      {...listeners}
    >
      {/* Imagem */}
      <div className="aspect-square relative overflow-hidden bg-black/40">
        <Image
          src={image.startsWith('http') ? image : `/api/images/${image}`}
          alt={`Foto ${index + 1}`}
          fill
          unoptimized
          className="object-cover transition-transform duration-500 group-hover:scale-[1.15]"
          draggable={false}
          onError={(e) => {
            console.error('Erro ao carregar imagem:', image);
            e.currentTarget.src = '/placeholder-image.svg';
          }}
        />

        {/* Overlay com gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d15]/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badge da foto principal */}
        {isMainPhoto && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-primary to-accent text-white text-[10px] uppercase px-3 py-1 rounded-full font-black tracking-widest shadow-lg">
            Cover
          </div>
        )}

        {/* Botão de remover */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(index);
          }}
          className="absolute top-3 right-3 bg-red-500/80 hover:bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-lg backdrop-blur-md border border-red-500/50"
        >
          ×
        </button>

        {/* Indicador de posição */}
        <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-md border border-white/10 text-white text-xs px-3 py-1.5 rounded-full font-bold font-mono">
          #{index + 1}
        </div>

        {/* Ícone de drag */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 backdrop-blur-md p-2 rounded-full border border-white/10">
          <svg className="w-4 h-4 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L11 6.414V16a1 1 0 11-2 0V6.414L7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zM3 3a1 1 0 000 2h1a1 1 0 000-2H3zM3 7a1 1 0 000 2h1a1 1 0 000-2H3zM3 11a1 1 0 100 2h1a1 1 0 100-2H3zM15 3a1 1 0 100 2h1a1 1 0 100-2h-1zM15 7a1 1 0 100 2h1a1 1 0 100-2h-1zM15 11a1 1 0 100 2h1a1 1 0 100-2h-1z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function ModernImageUpload({
  images = [],
  onImagesChange,
  onImageUpload,
  maxImages = 5,
  isUploading = false
}) {
  const [dragActive, setDragActive] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const fileInputRef = useRef(null);

  // Configuração dos sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Função para reordenar imagens
  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;

    if (active.id !== over?.id && over) {
      const oldIndex = images.findIndex((_, index) => `image-${index}` === active.id);
      const newIndex = images.findIndex((_, index) => `image-${index}` === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newImages = arrayMove(images, oldIndex, newIndex);
        onImagesChange?.(newImages);
      }
    }
  }, [images, onImagesChange]);

  // Função para remover imagem
  const handleRemoveImage = useCallback(async (index) => {
    const imageToRemove = images[index];

    // Delete from Vercel Blob if it's a blob URL
    if (imageToRemove && imageToRemove.startsWith('http')) {
      try {
        await fetch(`/api/upload/images?url=${encodeURIComponent(imageToRemove)}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.error('Error deleting blob image:', error);
      }
    }

    const newImages = images.filter((_, i) => i !== index);
    onImagesChange?.(newImages);
  }, [images, onImagesChange]);

  // Função para processar arquivos selecionados (declarada ANTES dos handlers que a usam)
  const handleFiles = useCallback((files) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (images.length + imageFiles.length > maxImages) {
      alert(`Você pode adicionar no máximo ${maxImages} imagens. Atualmente você tem ${images.length} imagens.`);
      return;
    }

    // Processar arquivos e fazer upload
    onImageUpload?.(imageFiles);
  }, [images.length, maxImages, onImageUpload]);

  // Handlers para drag and drop de arquivos
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleChange = useCallback((e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  }, [handleFiles]);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      {/* Área de upload */}
      <div
        className={`relative border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-500 overflow-hidden ${dragActive
          ? 'border-primary bg-primary/10 shadow-[0_0_30px_rgba(255,42,127,0.2)] scale-[1.02]'
          : 'border-white/20 bg-white/5 hover:border-primary/50 hover:bg-white/10'
          } ${isUploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'
          }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleChange}
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center space-y-4 relative z-10">
            <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-primary shadow-[0_0_15px_rgba(255,42,127,0.5)]"></div>
            <p className="text-lg font-bold text-white tracking-wide">Uploading MAGIC ✨...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-5 relative z-10">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 shadow-xl ${dragActive ? 'bg-gradient-to-tr from-primary to-accent scale-110' : 'bg-white/10 border border-white/10'
              }`}>
              <svg
                className={`w-10 h-10 transition-colors duration-300 ${dragActive ? 'text-white drop-shadow-md' : 'text-primary'
                  }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>

            <div>
              <p className="text-2xl font-black text-white mb-2 tracking-tight">
                {dragActive ? 'Drop files to upload!' : 'Drag & Drop your photos'}
              </p>
              <p className="text-white/50 text-sm font-medium">
                or <span className="text-primary font-bold hover:text-accent transition-colors">click to browse</span>
              </p>
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/50 uppercase tracking-widest">
                {images.length > 0
                  ? <><span className="text-primary">{images.length}/{maxImages}</span> photos attached</>
                  : <>Max {maxImages} files • JPEG, PNG, WEBP • Max 5MB</>
                }
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grid de imagens com drag and drop */}
      {images.length > 0 && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              Media Gallery <span className="text-primary">({images.length}/{maxImages})</span>
            </h3>
            <div className="text-xs text-white/40 bg-white/5 border border-white/10 px-4 py-2 rounded-full font-medium uppercase tracking-widest flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              Drag to reorder
            </div>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={images.map((_, index) => `image-${index}`)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {images.map((image, index) => (
                  <SortableImageItem
                    key={`image-${index}`}
                    id={`image-${index}`}
                    image={image}
                    index={index}
                    onRemove={handleRemoveImage}
                    isMainPhoto={index === 0}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Dicas de uso */}
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 backdrop-blur-sm">
            <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h4 className="text-sm font-black text-white mb-2 uppercase tracking-wide">Pro Tips for Maximum Impact</h4>
              <ul className="text-sm text-white/50 space-y-2 font-medium">
                <li><strong className="text-primary font-bold">Main Photo:</strong> The first image in the grid is your cover icon. Make it count!</li>
                <li><strong className="text-white font-bold">Quality:</strong> Clear, well-lit photos increase clicks up to 300%.</li>
                <li><strong className="text-white font-bold">Clean up:</strong> Just hit the <span className="text-red-400">×</span> on any photo to remove it instantly.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}