'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export default function FavoriteButton({ listingId, initialIsFavorited = false }) {
  const { data: session } = useSession();
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [loading, setLoading] = useState(false);

  const checkFavoriteStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/favorites/check?listingId=${listingId}`);
      if (response.ok) {
        const data = await response.json();
        setIsFavorited(data.isFavorited);
      }
    } catch (error) {
      console.error('Erro ao verificar favorito:', error);
    }
  }, [listingId]);

  useEffect(() => {
    if (session?.user?.id) {
      checkFavoriteStatus();
    }
  }, [session?.user?.id, checkFavoriteStatus]);

  const toggleFavorite = async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      const endpoint = isFavorited ? '/api/favorites/remove' : '/api/favorites/add';
      const method = isFavorited ? 'DELETE' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ listingId }),
      });

      if (response.ok) {
        setIsFavorited(!isFavorited);
      } else {
        const errorData = await response.json();
        console.error('Erro ao alterar favorito:', errorData.error);
      }
    } catch (error) {
      console.error('Erro ao alterar favorito:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!session?.user?.id) {
    return null;
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isFavorited
        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
        } disabled:opacity-50`}
    >
      <svg
        className={`w-5 h-5 ${isFavorited ? 'fill-current' : 'fill-none'
          }`}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {loading ? 'Carregando...' : isFavorited ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
    </button>
  );
}