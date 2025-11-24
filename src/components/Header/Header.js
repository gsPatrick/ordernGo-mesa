"use client";
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './Header.module.css';
import { FaSearch, FaBell, FaUserAlt, FaShoppingCart } from 'react-icons/fa';
import { IoIosArrowDown } from 'react-icons/io';
import { useRestaurant } from '@/context/RestaurantContext'; // Importa Contexto

const languages = {
  br: { name: 'Brasil', flag: '/flags/br.png', label: 'Português' },
  us: { name: 'USA', flag: '/flags/us.png', label: 'English' },
  es: { name: 'España', flag: '/flags/es.png', label: 'Español' },
  de: { name: 'Deutschland', flag: '/flags/de.png', label: 'Deutsch' },
  it: { name: 'Italia', flag: '/flags/it.png', label: 'Italiano' },
  fr: { name: 'France', flag: '/flags/fr.png', label: 'Français' },
};

const t = {
  search: { br: 'BUSCAR', us: 'SEARCH', es: 'BUSCAR', de: 'SUCHEN', it: 'CERCA', fr: 'CHERCHER' },
  table: { br: 'MESA', us: 'TABLE', es: 'MESA', de: 'TISCH', it: 'TAVOLO', fr: 'TABLE' },
  call: { br: 'CHAMAR', us: 'CALL', es: 'LLAMAR', de: 'RUFEN', it: 'CHIAMARE', fr: 'APPELER' },
  account: { br: 'CONTA', us: 'BILL', es: 'CUENTA', de: 'RECHNUNG', it: 'CONTO', fr: 'ADDITION' },
  cart: { br: 'PEDIDO', us: 'ORDER', es: 'PEDIDO', de: 'BESTELLUNG', it: 'ORDINE', fr: 'COMMANDE' }
};

export default function Header({ onCartClick, onAccountClick, onCallWaiter, tableNumber }) {
  // Usa o contexto para ler e setar idioma
  const { language, changeLanguage, restaurantConfig } = useRestaurant();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = languages[language] ? language : 'us';
  
  // Logo do restaurante ou padrão
  const logoUrl = restaurantConfig?.logoUrl 
    ? `https://geral-ordengoapi.r954jc.easypanel.host${restaurantConfig.logoUrl}` 
    : "/logocerta.png";

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
    changeLanguage(langCode); // Atualiza contexto global
    setIsDropdownOpen(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <Image src={logoUrl} alt="Logo" width={75} height={60} objectFit="contain" unoptimized={true} />
      </div>

      <div className={styles.rightSideGroup}>
        <div className={styles.navigation}>
          <div className={styles.searchBar}>
            <FaSearch style={{ color: 'var(--primary-color)' }} />
            <input type="text" placeholder={t.search[currentLang]} className={styles.searchInput} />
          </div>
          <div className={styles.divider}></div>
          <div className={styles.tableInfo}>
            <span>{t.table[currentLang]} {tableNumber || '--'}</span>
          </div>
          <div className={styles.divider}></div>
          
          <div className={styles.languageSelectorWrapper} ref={dropdownRef}>
            <div className={styles.languageSelector} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <Image src={languages[currentLang].flag} alt="Idioma" width={34} height={24} className={styles.flagImage} />
              <IoIosArrowDown color="#ccc" />
            </div>
            {isDropdownOpen && (
              <div className={styles.dropdownMenu}>
                {Object.keys(languages)
                  .filter((lang) => lang !== currentLang)
                  .map((langCode) => (
                    <div key={langCode} className={styles.dropdownItem} onClick={() => handleLanguageSelect(langCode)}>
                      <Image src={languages[langCode].flag} alt={languages[langCode].name} width={34} height={24} className={styles.flagImage} />
                      <span>{languages[langCode].name}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.actionButton} onClick={onCallWaiter}>
            <FaBell size={20} />
            <span>{t.call[currentLang]}</span>
          </button>
          <button className={styles.actionButton} onClick={onAccountClick}>
            <FaUserAlt size={20} />
            <span>{t.account[currentLang]}</span>
          </button>
          <button className={styles.actionButton} onClick={onCartClick}>
            <FaShoppingCart size={20} />
            <span>{t.cart[currentLang]}</span>
          </button>
        </div>
      </div>
    </header>
  );
}