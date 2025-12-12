"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './AboutModal.module.css';
import { FaTimes, FaWifi, FaCopy } from 'react-icons/fa';
import api from '@/lib/api';
import { getTrans } from '@/utils/i18n';

// URL base para imagens
const BASE_IMG_URL = 'https://geral-ordengoapi.r954jc.easypanel.host';

export default function AboutModal({ isOpen, onClose, language }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dicionário de Traduções Estáticas
  const t = {
    loading: { br: 'Carregando...', us: 'Loading...', es: 'Cargando...', de: 'Laden...', it: 'Caricamento...', fr: 'Chargement...' },
    copied: { br: 'Copiado!', us: 'Copied!', es: '¡Copiado!', de: 'Kopiert!', it: 'Copiato!', fr: 'Copié!' },
    wifiTitle: { br: 'Wi-Fi Grátis', us: 'Free Wi-Fi', es: 'Wi-Fi Gratis', de: 'Gratis WLAN', it: 'Wi-Fi Gratuito', fr: 'Wi-Fi Gratuit' },
    network: { br: 'Rede', us: 'Network', es: 'Red', de: 'Netzwerk', it: 'Rete', fr: 'Réseau' },
    password: { br: 'Senha', us: 'Password', es: 'Contraseña', de: 'Passwort', it: 'Password', fr: 'Mot de passe' },
    historyTitle: { br: 'Nossa Jornada', us: 'Our Journey', es: 'Nuestra Jornada', de: 'Unsere Reise', it: 'Il Nostro Viaggio', fr: 'Notre Voyage' },
    defaultTitle: { br: 'Sobre Nós', us: 'About Us', es: 'Sobre Nosotros', de: 'Über Uns', it: 'Chi Siamo', fr: 'À Propos' },
    defaultText: { br: 'Bem-vindo ao nosso restaurante.', us: 'Welcome to our restaurant.', es: 'Bienvenido a nuestro restaurante.', de: 'Willkommen in unserem Restaurant.', it: 'Benvenuti nel nostro ristorante.', fr: 'Bienvenue dans notre restaurant.' }
  };

  // Fallback de idioma
  const lang = t.loading[language] ? language : 'us';

  useEffect(() => {
    if (isOpen) {
      const fetchConfig = async () => {
        try {
          setLoading(true);
          const response = await api.get('/settings');
          setConfig(response.data.data.config);
        } catch (error) {
          console.error("Erro ao carregar informações Sobre:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchConfig();
    }
  }, [isOpen]);

  const copyWifi = (text) => {
    navigator.clipboard.writeText(text);
    alert(t.copied[lang]);
  };

  if (!isOpen) return null;

  // Returns null if no path - prevents broken placeholder images
  const getImgUrl = (path) => path ? `${BASE_IMG_URL}${path}` : null;

  const thumb1 = config?.highlightImagesSmall?.[0] || null;
  const thumb2 = config?.highlightImagesSmall?.[1] || null;
  const mainImg = config?.highlightImagesLarge?.[0] || null;
  const bannerImg = config?.institutionalBanners?.[0] || null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalPanel} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}><FaTimes size={18} /></button>

        {loading ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p>{t.loading[lang]}</p>
          </div>
        ) : (
          <div className={styles.modalContent}>

            {/* Seção Superior */}
            <section className={styles.topSection}>
              <div className={styles.textColumn}>
                <h2>{getTrans(config?.publicTitle, language) || getTrans(config?.aboutTitle, language) || t.defaultTitle[lang]}</h2>

                <p className={styles.justifiedText}>
                  {getTrans(config?.aboutText, language) || t.defaultText[lang]}
                </p>

                {/* Thumbs - only render if images exist */}
                {(thumb1 || thumb2) && (
                  <div className={styles.thumbImages}>
                    {thumb1 && (
                      <div className={styles.thumbImageContainer}>
                        <Image src={getImgUrl(thumb1)} alt="Thumb 1" layout="fill" objectFit="cover" className={styles.animatedImage} unoptimized={true} />
                      </div>
                    )}
                    {thumb2 && (
                      <div className={styles.thumbImageContainer}>
                        <Image src={getImgUrl(thumb2)} alt="Thumb 2" layout="fill" objectFit="cover" className={styles.animatedImage} unoptimized={true} />
                      </div>
                    )}
                  </div>
                )}

                {/* Wi-Fi */}
                {config?.wifiSsid && (
                  <div className={styles.wifiContainer}>
                    <div className={styles.wifiHeader}>
                      <FaWifi className={styles.wifiIcon} />
                      <span>{t.wifiTitle[lang]}</span>
                    </div>
                    <div className={styles.wifiDetails}>
                      <div className={styles.wifiRow} onClick={() => copyWifi(config.wifiSsid)}>
                        <span className={styles.wifiLabel}>{t.network[lang]}:</span>
                        <strong className={styles.wifiValue}>{config.wifiSsid}</strong>
                        <FaCopy className={styles.copyIcon} />
                      </div>
                      {config.wifiPassword && (
                        <div className={styles.wifiRow} onClick={() => copyWifi(config.wifiPassword)}>
                          <span className={styles.wifiLabel}>{t.password[lang]}:</span>
                          <strong className={styles.wifiValue}>{config.wifiPassword}</strong>
                          <FaCopy className={styles.copyIcon} />
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>

              {/* Main image - only render if exists */}
              {mainImg && (
                <div className={styles.mainImageColumn}>
                  <Image src={getImgUrl(mainImg)} alt="Main" layout="fill" objectFit="cover" className={styles.animatedImage} unoptimized={true} />
                </div>
              )}
            </section>

            {/* Banner - only render if exists */}
            {bannerImg && (
              <section className={styles.bannerSection}>
                <div className={styles.bannerImageContainer}>
                  <Image src={getImgUrl(bannerImg)} alt="Banner" layout="fill" objectFit="cover" className={styles.animatedImage} unoptimized={true} />
                </div>
              </section>
            )}

            {/* História */}
            <section className={styles.bottomSection}>
              <h3>{t.historyTitle[lang]}</h3>
              <p className={styles.justifiedText}>
                {getTrans(config?.ourHistory, language) || getTrans(config?.aboutText, language)}
              </p>
            </section>

          </div>
        )}
      </div>
    </div>
  );
}