"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function BanCheck({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isBanned, setIsBanned] = useState(false);

  useEffect(() => {
    const checkBanStatus = async () => {
      if (status === "loading") return;
      
      // Se não há sessão, não precisa verificar banimento
      if (!session?.user?.id) {
        setIsChecking(false);
        return;
      }

      try {
        const response = await fetch('/api/user/ban-status');
        const data = await response.json();
        
        if (data.isBanned) {
          setIsBanned(true);
          router.push('/banned');
          return;
        }
        
        setIsBanned(false);
      } catch (error) {
        console.error('Erro ao verificar status de banimento:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkBanStatus();
  }, [session, status, router]);

  // Mostra loading enquanto verifica
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  // Se está banido, não renderiza o conteúdo (será redirecionado)
  if (isBanned) {
    return null;
  }

  // Renderiza o conteúdo normalmente
  return children;
}