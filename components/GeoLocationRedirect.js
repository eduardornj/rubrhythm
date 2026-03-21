"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import locations from "../data/datalocations";

export default function GeoLocationRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const [hasRedirected, setHasRedirected] = useState(false);

  // Função para encontrar a cidade mais próxima baseada na localização
  const findNearestCity = (userLat, userLon) => {
    let nearestCity = null;
    let minDistance = Infinity;

    // Coordenadas aproximadas das principais cidades
    const cityCoordinates = {
      "Orlando": { lat: 28.5383, lon: -81.3792, state: "Florida" },
      "Miami": { lat: 25.7617, lon: -80.1918, state: "Florida" },
      "Los Angeles": { lat: 34.0522, lon: -118.2437, state: "California" },
      "New York": { lat: 40.7128, lon: -74.0060, state: "New York" },
      "Chicago": { lat: 41.8781, lon: -87.6298, state: "Illinois" },
      "Houston": { lat: 29.7604, lon: -95.3698, state: "Texas" },
      "Atlanta": { lat: 33.7490, lon: -84.3880, state: "Georgia" },
      "Las Vegas": { lat: 36.1699, lon: -115.1398, state: "Nevada" },
      "Phoenix": { lat: 33.4484, lon: -112.0740, state: "Arizona" },
      "Philadelphia": { lat: 39.9526, lon: -75.1652, state: "Pennsylvania" }
    };

    // Calcular distância usando fórmula de Haversine
    Object.entries(cityCoordinates).forEach(([cityName, coords]) => {
      const R = 6371; // Raio da Terra em km
      const dLat = (coords.lat - userLat) * Math.PI / 180;
      const dLon = (coords.lon - userLon) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(userLat * Math.PI / 180) * Math.cos(coords.lat * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      if (distance < minDistance) {
        minDistance = distance;
        nearestCity = {
          name: cityName,
          state: coords.state,
          distance: distance
        };
      }
    });

    return nearestCity;
  };

  // Função para redirecionar para a cidade
  const redirectToCity = useCallback((cityName, stateName) => {
    const stateSlug = stateName.toLowerCase().replace(/\s+/g, "-");
    const citySlug = cityName.toLowerCase().replace(/\s+/g, "-");
    const targetUrl = `/united-states/${stateSlug}/${citySlug}`;

    // Verificar se a cidade existe no nosso banco de dados
    const stateData = locations.find(loc => loc.state === stateName);
    if (stateData) {
      const cityData = stateData.cities.find(city => city.name === cityName);
      if (cityData) {
        router.push(targetUrl);
        return true;
      }
    }
    return false;
  }, [router]);

  useEffect(() => {
    // Só executar na página inicial e se ainda não redirecionou
    if (pathname !== "/" || hasRedirected) {
      return;
    }

    // Verificar se o usuário já visitou antes (localStorage)
    const hasVisitedBefore = localStorage.getItem("rubrhythm_visited");
    if (hasVisitedBefore) {
      return;
    }

    // Only request geolocation if permission was already granted (avoid prompt on page load)
    if ("geolocation" in navigator && navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        if (result.state !== "granted") return; // Don't prompt — only use if already allowed
        navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const nearestCity = findNearestCity(latitude, longitude);

          if (nearestCity && nearestCity.distance < 100) { // Dentro de 100km
            const redirected = redirectToCity(nearestCity.name, nearestCity.state);
            if (redirected) {
              setHasRedirected(true);
              localStorage.setItem("rubrhythm_visited", "true");
              localStorage.setItem('locationRedirected', 'true');
              localStorage.setItem('userLocation', JSON.stringify({
                city: nearestCity.name,
                state: nearestCity.state
              }));
              localStorage.setItem('currentCity', nearestCity.name);
              localStorage.setItem('currentState', nearestCity.state);
            }
          }
        },
        (error) => {
          console.log("Geolocation error:", error.message);
          // Fallback: tentar detectar por IP (opcional)
        },
        {
          timeout: 5000,
          maximumAge: 300000, // Cache por 5 minutos
          enableHighAccuracy: false
        }
      );
      }).catch(() => {});
    }
  }, [pathname, router, hasRedirected, redirectToCity]);

  return null; // Este componente não renderiza nada
}