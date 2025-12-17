"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './Sidebar.module.css';
import { FaStar, FaBars, FaInfoCircle, FaRegCommentDots } from 'react-icons/fa';
import { BsFillTagFill } from 'react-icons/bs';
import { IoIosArrowUp } from 'react-icons/io';
import { useRestaurant } from '@/context/RestaurantContext';

const languages = {
  br: { name: 'Brasil', flag: '/flags/br.png', label: 'Português' },
  us: { name: 'USA', flag: '/flags/us.png', label: 'English' },
  es: { name: 'España', flag: '/flags/es.png', label: 'Español' },
  de: { name: 'Deutschland', flag: '/flags/de.png', label: 'Deutsch' },
  it: { name: 'Italia', flag: '/flags/it.png', label: 'Italiano' },
  fr: { name: 'France', flag: '/flags/fr.png', label: 'Français' },
};

const t = {
  highlights: { br: 'DESTAQUES', us: 'HIGHLIGHTS', es: 'DESTACADOS', de: 'HIGHLIGHTS', it: 'IN EVIDENZA', fr: 'VEDETTE' },
  menu: { br: 'MENU', us: 'MENU', es: 'MENÚ', de: 'SPEISEKARTE', it: 'MENU', fr: 'MENU' },
  offers: { br: 'OFERTAS', us: 'OFFERS', es: 'OFERTAS', de: 'ANGEBOTE', it: 'OFFERTE', fr: 'OFFRES' },
  about: { br: 'SOBRE', us: 'ABOUT', es: 'SOBRE', de: 'ÜBER', it: 'INFO', fr: 'À PROPOS' },
  review: { br: 'AVALIE', us: 'REVIEW', es: 'EVALUAR', de: 'BEWERTEN', it: 'VALUTA', fr: 'AVIS' }
};

export default function Sidebar({
  onReviewClick,
  onAboutClick,
  onBrandLogoClick,
  onSecretMenu, // <--- NOVO PROP: Função para abrir menu secreto
  activeCategory,
  onCategoryClick
}) {
  const { language, changeLanguage, restaurantConfig } = useRestaurant();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Controle de Cliques Secretos
  const [clickCount, setClickCount] = useState(0);
  const clickTimeoutRef = useRef(null);

  const currentLang = languages[language] ? language : 'br';

  // Logo fixa do Ordengo na Sidebar (conforme solicitado)
  const logoUrl = "/logocerta.png";

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageSelect = (langCode) => {
    changeLanguage(langCode);
    setIsDropdownOpen(false);
  };

  // Lógica do Clique Secreto (5 cliques em 2 segundos)
  const handleLogoClick = () => {
    // Incrementa contador
    setClickCount(prev => prev + 1);

    // Reseta o timer a cada clique para dar tempo
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);

    // Se chegou em 5 cliques, dispara a ação e reseta
    if (clickCount + 1 >= 5) {
      if (onSecretMenu) onSecretMenu(); // Chama a função passada pelo pai
      setClickCount(0);
    } else {
      // Se parar de clicar por 1 segundo, zera a contagem
      clickTimeoutRef.current = setTimeout(() => {
        setClickCount(0);
      }, 1000);

      // Mantém o comportamento original de abrir o BrandModal (sobre o sistema)
      if (onBrandLogoClick) onBrandLogoClick();
    }
  };

  return (
    <aside className={styles.sidebar}>

      <div className={styles.mainNav}>
        <button
          className={`${styles.navButton} ${activeCategory === 'destaques' ? styles.active : ''}`}
          onClick={() => onCategoryClick('destaques')}
        >
          <FaStar size={24} />
          <span>{t.highlights[currentLang]}</span>
        </button>

        <button
          className={`${styles.navButton} ${activeCategory === 'menu' ? styles.active : ''}`}
          onClick={() => onCategoryClick('menu')}
        >
          <FaBars size={24} />
          <span>{t.menu[currentLang]}</span>
        </button>

        <button
          className={`${styles.navButton} ${activeCategory === 'ofertas' ? styles.active : ''}`}
          onClick={() => onCategoryClick('ofertas')}
        >
          <BsFillTagFill size={24} />
          <span>{t.offers[currentLang]}</span>
        </button>
      </div>

      <div className={styles.footerNav}>

        <button onClick={onAboutClick} className={styles.footerLinkButton}>
          <FaInfoCircle size={14} style={{ marginBottom: '4px' }} />
          {t.about[currentLang]}
        </button>

        <button onClick={onReviewClick} className={styles.footerLinkButton}>
          <FaRegCommentDots size={14} style={{ marginBottom: '4px' }} />
          {t.review[currentLang]}
        </button>

        {/* Language Selector Removed as per request */}

        {/* LOGO DO RESTAURANTE COM CLICK SECRETO */}
        <button onClick={handleLogoClick} className={styles.brandLogoButton}>
          <Image
            src={logoUrl}
            alt="Logo Restaurante"
            width={50}
            height={50}
            objectFit="contain"
            unoptimized={true}
          />
        </button>
      </div>
    </aside>
  );
}