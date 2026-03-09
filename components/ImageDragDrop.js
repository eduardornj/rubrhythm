"use client";
import React from 'react';
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Componente individual de imagem arrastável
function SortableImageItem({ id, imageUrl, index, onRemove, isMainPhoto }) {
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
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative group cursor-move ${isDragging ? 'z-50' : ''
        } ${isMainPhoto ? 'ring-2 ring-accent ring-offset-2 ring-offset-background' : ''
        }`}
    >
      <div className="relative overflow-hidden rounded-lg bg-gray-100 h-32">
        <Image
          src={imageUrl}
          alt={`Photo ${index + 1}`}
          fill
          unoptimized
          className="object-cover transition-transform group-hover:scale-105"
          draggable={false}
        />

        {/* Badge da foto principal */}
        {isMainPhoto && (
          <div className="absolute top-2 left-2 bg-accent text-white text-xs px-2 py-1 rounded-full font-semibold">
            Principal
          </div>
        )}

        {/* Botão de remover */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(index);
          }}
          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
        >
          ×
        </button>

        {/* Indicador de drag */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
          <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z" />
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z" transform="rotate(90 10 10)" />
            </svg>
          </div>
        </div>
      </div>

      {/* Número da posição */}
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
        {index + 1}
      </div>
    </div>
  );
}

// Componente principal de drag-and-drop
export default function ImageDragDrop({ images, onImagesReorder, onImageRemove }) {
  // Verificações de segurança para props
  const safeImages = Array.isArray(images) ? images : [];
  const safeOnImagesReorder = typeof onImagesReorder === 'function' ? onImagesReorder : () => { };
  const safeOnImageRemove = typeof onImageRemove === 'function' ? onImageRemove : () => { };

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

  function handleDragEnd(event) {
    const { active, over } = event;

    if (active.id !== over?.id && over) {
      const oldIndex = safeImages.findIndex((_, index) => `image-${index}` === active.id);
      const newIndex = safeImages.findIndex((_, index) => `image-${index}` === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newImages = arrayMove(safeImages, oldIndex, newIndex);
        safeOnImagesReorder(newImages);
      }
    }
  }

  if (safeImages.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-accent">
          Fotos Atuais ({images.length}/5)
        </h3>
        <div className="text-sm text-text opacity-75">
          Arraste para reordenar • Primeira foto é a principal
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={safeImages.map((_, index) => `image-${index}`)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {safeImages.map((imageUrl, index) => (
              <SortableImageItem
                key={`image-${index}`}
                id={`image-${index}`}
                imageUrl={imageUrl}
                index={index}
                onRemove={safeOnImageRemove}
                isMainPhoto={index === 0}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Dica de uso */}
      <div className="mt-4 p-3 bg-accent/10 rounded-lg border border-accent/20">
        <div className="flex items-start space-x-2">
          <svg className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-text">
            <p className="font-medium mb-1">Como usar:</p>
            <ul className="space-y-1 text-xs opacity-75">
              <li>• Arraste as fotos para reordená-las</li>
              <li>• A primeira foto será sempre a foto principal</li>
              <li>• Clique no × para remover uma foto</li>
              <li>• Máximo de 5 fotos por anúncio</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}