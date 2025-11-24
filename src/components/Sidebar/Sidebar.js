"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './Sidebar.module.css';
import { FaStar, FaBars, FaInfoCircle, FaRegCommentDots } from 'react-icons/fa';
import { BsFillTagFill } from 'react-icons/bs';
import { IoIosArrowUp } from 'react-icons/io'; // Seta para cima (pois o menu abre para cima)
import { useRestaurant } from '@/context/RestaurantContext';

// Configuração dos Idiomas
const languages = {
  br: { name: 'Brasil', flag: '/flags/br.png', label: 'Português' },
  us: { name: 'USA', flag: '/flags/us.png', label: 'English' },
  es: { name: 'España', flag: '/flags/es.png', label: 'Español' },
  de: { name: 'Deutschland', flag: '/flags/de.png', label: 'Deutsch' },
  it: { name: 'Italia', flag: '/flags/it.png', label: 'Italiano' },
  fr: { name: 'France', flag: '/flags/fr.png', label: 'Français' },
};

// Traduções da Sidebar
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
  activeCategory, 
  onCategoryClick 
}) {
  // Consumindo Contexto Global
  const { language, changeLanguage, restaurantConfig } = useRestaurant();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = languages[language] ? language : 'br';
  const logoUrl = restaurantConfig?.logoUrl 
    ? `https://geral-ordengoapi.r954jc.easypanel.host${restaurantConfig.logoUrl}` 
    : "/logocerta.png";

  // Fecha dropdown ao clicar fora
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
    changeLanguage(langCode); // Atualiza no contexto (muda no Header também)
    setIsDropdownOpen(false);
  };

  return (
    <aside className={styles.sidebar}>
      
      {/* NAVEGAÇÃO PRINCIPAL */}
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
      
      {/* RODAPÉ DA SIDEBAR */}
      <div className={styles.footerNav}>
        
        {/* Links Auxiliares */}
        <button onClick={onAboutClick} className={styles.footerLinkButton}>
          <FaInfoCircle size={14} style={{marginBottom: '4px'}}/>
          {t.about[currentLang]}
        </button>
        
        <button onClick={onReviewClick} className={styles.footerLinkButton}>
          <FaRegCommentDots size={14} style={{marginBottom: '4px'}}/>
          {t.review[currentLang]}
        </button>
        
        {/* Seletor de Idioma (Dropdown Up) */}
        <div className={styles.languageWrapper} ref={dropdownRef}>
          <button 
            className={styles.languageButton} 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <Image 
              src={languages[currentLang].flag} 
              alt="Idioma" 
              width={30} 
              height={20} 
              className={styles.flagImage} 
            />
            <IoIosArrowUp color="#aaa" size={14} />
          </button>

          {isDropdownOpen && (
            <div className={styles.dropdownMenu}>
              {Object.keys(languages)
                .filter((lang) => lang !== currentLang)
                .map((langCode) => (
                  <div 
                    key={langCode} 
                    className={styles.dropdownItem} 
                    onClick={() => handleLanguageSelect(langCode)}
                  >
                    <Image 
                      src={languages[langCode].flag} 
                      alt={languages[langCode].name} 
                      width={24} 
                      height={16} 
                      className={styles.flagImage} 
                    />
                    <span>{languages[langCode].name}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
        
        {/* Logo do Restaurante */}
        <button onClick={onBrandLogoClick} className={styles.brandLogoButton}>
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