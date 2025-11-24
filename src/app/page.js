// src/app/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Cookies from 'js-cookie';
import styles from './page.module.css';

export default function LanguageSelection() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  // 1. Proteção de Rota: Se não tiver configurado, manda para o Setup
  useEffect(() => {
    const token = Cookies.get('ordengo_table_token');
    if (!token) {
      router.push('/setup');
    } else {
      setIsChecking(false);
    }
  }, [router]);

  const selectLanguage = (lang) => {
    // Salva a preferência para o Cardápio ler depois
    Cookies.set('ordengo_lang', lang, { expires: 365 });
    router.push('/cardapio');
  };

  if (isChecking) return null; // Ou um loading spinner

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Welcome to OrdenGo</h1>
        <h2 className={styles.subtitle}>Please select your language</h2>

        <div className={styles.flagsContainer}>
          {/* REMOVIDO BRASIL CONFORME SOLICITADO */}

          <div className={styles.flagCard} onClick={() => selectLanguage('us')}>
            <div className={styles.imageWrapper}>
              <Image
                src="/flags/us.png"
                alt="English"
                layout="fill"
                objectFit="cover"
              />
            </div>
            <span className={styles.languageName}>English</span>
          </div>

          <div className={styles.flagCard} onClick={() => selectLanguage('es')}>
            <div className={styles.imageWrapper}>
              <Image
                src="/flags/es.png"
                alt="Español"
                layout="fill"
                objectFit="cover"
              />
            </div>
            <span className={styles.languageName}>Español</span>
          </div>
        </div>
      </div>
    </main>
  );
}