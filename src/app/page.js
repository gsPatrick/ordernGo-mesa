// src/app/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Cookies from 'js-cookie';
import styles from './page.module.css';
import { FaSpinner } from 'react-icons/fa';

// Lista completa de idiomas suportados pelo sistema
const LANGUAGES = [
  { code: 'br', name: 'Português', flag: '/flags/br.png' },
  { code: 'us', name: 'English', flag: '/flags/us.png' },
  { code: 'es', name: 'Español', flag: '/flags/es.png' },
  { code: 'de', name: 'Deutsch', flag: '/flags/de.png' },
  { code: 'it', name: 'Italiano', flag: '/flags/it.png' },
  { code: 'fr', name: 'Français', flag: '/flags/fr.png' },
];

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

  if (isChecking) {
    return (
      <div className={styles.loadingContainer}>
        <FaSpinner className={styles.spinner} />
      </div>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Bem-vindo ao OrdenGo</h1>
        <h2 className={styles.subtitle}>Selecione seu idioma / Select your language</h2>

        <div className={styles.flagsContainer}>
          {LANGUAGES.map((lang) => (
            <div 
              key={lang.code} 
              className={styles.flagCard} 
              onClick={() => selectLanguage(lang.code)}
            >
              <div className={styles.imageWrapper}>
                <Image
                  src={lang.flag}
                  alt={lang.name}
                  layout="fill"
                  objectFit="cover"
                  priority // Carrega rápido para não piscar
                />
              </div>
              <span className={styles.languageName}>{lang.name}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}