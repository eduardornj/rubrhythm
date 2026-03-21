"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { analytics } from "@/lib/analytics";

export default function FavoriteButton({ userId, listingId, initialIsFavorited, variant = "default" }) {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    setIsFavorited(initialIsFavorited);
  }, [initialIsFavorited]);

  const toggleFavorite = async () => {
    if (!session?.user?.id) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    const newIsFavorited = !isFavorited;
    
    try {
      const response = await fetch("/myaccount/api/favorites", {
        method: newIsFavorited ? "POST" : "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingId,
        }),
      });

      if (response.ok) {
        setIsFavorited(newIsFavorited);
        if (newIsFavorited) {
          analytics.addFavorite(listingId, '');
        }
        // Show success message instead of redirecting
        console.log(newIsFavorited ? 'Added to favorites' : 'Removed from favorites');
      } else {
        const errorData = await response.json();
        console.error('Error:', errorData.error);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Default variant - heart icon
  if (variant === "default") {
    return (
      <button
        onClick={toggleFavorite}
        disabled={isLoading}
        className={`relative group transition-all duration-200 ${
          isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
        }`}
        title={isFavorited ? "Remove from favorites" : "Add to favorites"}
      >
        <div className="relative">
          {isFavorited ? (
            <svg className="w-6 h-6 text-red-500 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          ) : (
            <svg className="w-6 h-6 text-gray-400 group-hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </button>
    );
  }

  // Sophisticated variant - button with text
  if (variant === "sophisticated") {
    return (
      <button
        onClick={toggleFavorite}
        disabled={isLoading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
          isFavorited 
            ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg' 
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white border border-gray-600'
        } ${
          isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-xl'
        }`}
        title={isFavorited ? "Remove from favorites" : "Add to favorites"}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            {isFavorited ? (
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            ) : (
              <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/>
            )}
          </svg>
        )}
        <span className="text-sm">
          {isFavorited ? 'Favorited' : 'Add to Favorites'}
        </span>
      </button>
    );
  }

  // Compact variant - small heart
  return (
    <button
      onClick={toggleFavorite}
      disabled={isLoading}
      className={`p-2 rounded-full transition-all duration-200 ${
        isFavorited 
          ? 'bg-red-500 text-white hover:bg-red-600' 
          : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-red-400'
      } ${
        isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
      }`}
      title={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          {isFavorited ? (
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          ) : (
            <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/>
          )}
        </svg>
      )}
    </button>
  );
}