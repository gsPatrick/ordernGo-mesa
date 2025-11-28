"use client";
import { useEffect } from 'react';

export default function KioskGuard() {
  
  useEffect(() => {
    // 1. Bloquear Menu de Contexto (Botão direito / Toque longo)
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // 2. Bloquear Atalhos de Teclado (F5, Ctrl+R) caso tenha teclado bluetooth
    const handleKeyDown = (e) => {
      if (
        e.key === 'F5' || 
        (e.ctrlKey && e.key === 'r') || 
        (e.metaKey && e.key === 'r')
      ) {
        e.preventDefault();
      }
    };

    // 3. WAKE LOCK API (Manter a tela ligada sempre)
    let wakeLock = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
          console.log('💡 Tela mantida ativa (Wake Lock ON)');
        }
      } catch (err) {
        console.error('Erro ao ativar Wake Lock:', err);
      }
    };

    // Reativar Wake Lock se o app voltar de segundo plano
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    // Ativar listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Tenta ativar o Wake Lock ao montar
    requestWakeLock();

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLock) wakeLock.release();
    };
  }, []);

  return null; // Este componente não renderiza nada visual
}