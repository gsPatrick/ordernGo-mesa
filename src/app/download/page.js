'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Download, 
  Share, 
  PlusSquare, 
  Smartphone, 
  CheckCircle, 
  ArrowRight,
  Loader2
} from 'lucide-react';
import styles from './page.module.css';

export default function DownloadPage() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isReady, setIsReady] = useState(false); // Para evitar flash de conteúdo

  useEffect(() => {
    // 1. Verifica se já está instalado (Modo App)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
    }

    // 2. Detecta iOS (para mostrar instruções manuais, pois iOS não permite botão direto)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIphone = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIphone);

    // 3. Captura o evento de instalação (Android/Chrome/Edge)
    const handleBeforeInstallPrompt = (e) => {
      // Impede que o Chrome mostre o banner automático feio
      e.preventDefault();
      // Guarda o evento para disparar quando clicarmos no botão
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Marca como pronto após verificar ambiente
    setIsReady(true);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Mostra o prompt nativo do Android
    deferredPrompt.prompt();
    
    // Espera a escolha do usuário
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null); // Esconde o botão se aceitou
    }
  };

  if (!isReady) return <div className={styles.loading}><Loader2 className="animate-spin text-white" /></div>;

  return (
    <div className={styles.container}>
      
      {/* Fundo Decorativo */}
      <div className={styles.background}>
        <div className={styles.blob1}></div>
        <div className={styles.blob2}></div>
      </div>

      <div className={styles.content}>
        
        {/* Lado Esquerdo: Visual */}
        <div className={styles.visualSection}>
          <div className={styles.logoContainer}>
             <Image src="/logocerta.png" alt="OrdenGo" width={120} height={100} objectFit="contain" unoptimized={true} />
          </div>
          <h1 className={styles.title}>
            OrdenGo <br />
            <span className={styles.highlight}>Mesa & Garçom</span>
          </h1>
          <p className={styles.subtitle}>
            Instale o aplicativo oficial para transformar este dispositivo em um terminal de autoatendimento rápido e seguro.
          </p>

          <div className={styles.features}>
            <div className={styles.featureItem}>
              <CheckCircle size={20} className={styles.iconCheck} />
              <span>Modo Tela Cheia (Kiosk)</span>
            </div>
            <div className={styles.featureItem}>
              <CheckCircle size={20} className={styles.iconCheck} />
              <span>Notificações em Tempo Real</span>
            </div>
            <div className={styles.featureItem}>
              <CheckCircle size={20} className={styles.iconCheck} />
              <span>Maior Performance</span>
            </div>
          </div>
        </div>

        {/* Lado Direito: Ação */}
        <div className={styles.actionSection}>
          
          {/* CASO 1: JÁ INSTALADO */}
          {isStandalone ? (
            <div className={styles.successCard}>
              <div className={styles.iconSuccess}>
                <CheckCircle size={48} />
              </div>
              <h2>Aplicativo Ativo!</h2>
              <p>Você já está utilizando a versão aplicativo do OrdenGo.</p>
              <button onClick={() => window.location.href = '/'} className={styles.openButton}>
                Acessar Sistema
              </button>
            </div>
          ) : (
            <>
              {/* CASO 2: ANDROID / CHROME (BOTÃO AUTOMÁTICO) */}
              {deferredPrompt && (
                <div className={styles.installCard}>
                  <div className={styles.iconInstall}>
                    <Download size={40} />
                  </div>
                  <h2>Instalar Agora</h2>
                  <p>Clique abaixo para baixar e instalar o App automaticamente.</p>
                  
                  {/* ESSE BOTÃO DISPARA A INSTALAÇÃO NATIVA */}
                  <button onClick={handleInstallClick} className={styles.installButton}>
                    BAIXAR APP <ArrowRight size={18} />
                  </button>
                </div>
              )}

              {/* CASO 3: iOS (IPAD/IPHONE) - INSTRUÇÕES MANUAIS */}
              {isIOS && (
                <div className={styles.iosCard}>
                  <div className={styles.iosHeader}>
                    <Smartphone size={32} />
                    <h3>Instalação no iOS</h3>
                  </div>
                  <p>A Apple exige instalação manual. Siga os passos:</p>
                  <ol className={styles.stepsList}>
                    <li>
                      1. Toque no botão <strong>Compartilhar</strong> <Share size={16} className="inline" /> na barra do navegador.
                    </li>
                    <li>
                      2. Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong> <PlusSquare size={16} className="inline" />.
                    </li>
                    <li>
                      3. Confirme clicando em <strong>Adicionar</strong> no canto superior.
                    </li>
                  </ol>
                </div>
              )}

              {/* CASO 4: FALLBACK (SE NÃO FOR POSSÍVEL DETECTAR) */}
              {!deferredPrompt && !isIOS && (
                <div className={styles.manualCard}>
                  <h3>Não foi possível instalar automaticamente</h3>
                  <p>Verifique se você já tem o App instalado ou use o menu do navegador ({`:`}) e clique em <strong>"Instalar Aplicativo"</strong> ou <strong>"Adicionar à Tela Inicial"</strong>.</p>
                  <button onClick={() => window.location.href = '/'} className={styles.linkButton}>
                    Continuar no Navegador
                  </button>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}