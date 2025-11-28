"use client";
import { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import styles from './Header.module.css';
import { FaSearch, FaBell, FaUserAlt, FaShoppingCart, FaTimes } from 'react-icons/fa';
import { IoIosArrowDown } from 'react-icons/io';
import { useRestaurant } from '@/context/RestaurantContext';
import { getTrans, formatCurrency } from '@/utils/i18n';

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
call: {
  br: 'CHAMAR GARÇOM',
  us: 'CALL WAITER',
  es: 'LLAMAR CAMARERO',
  de: 'KELLNER RUFEN',
  it: 'CHIAMARE CAMERIERE',
  fr: 'APPELER SERVEUR'
},
  account: { br: 'CONTA', us: 'BILL', es: 'CUENTA', de: 'RECHNUNG', it: 'CONTO', fr: 'ADDITION' },
  cart: { br: 'PEDIDO', us: 'ORDER', es: 'PEDIDO', de: 'BESTELLUNG', it: 'ORDINE', fr: 'COMMANDE' },
  noResults: { br: 'Nenhum produto encontrado', us: 'No products found', es: 'Ningún producto encontrado' }
};

// URL base para imagens
const BASE_IMG_URL = 'https://geral-ordengoapi.r954jc.easypanel.host';

export default function Header({ onCartClick, onAccountClick, onCallWaiter, tableNumber, menuData = [], onSearchSelect }) {
  const { language, changeLanguage, restaurantConfig } = useRestaurant();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);

  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  const currentLang = languages[language] ? language : 'us';
  
  const logoUrl = restaurantConfig?.logoUrl 
    ? `${BASE_IMG_URL}${restaurantConfig.logoUrl}` 
    : "/logocerta.png";

  // 1. ACHATAR A LISTA DE PRODUTOS (Categories -> Subcategories -> Products)
  const allProducts = useMemo(() => {
    if (!menuData) return [];
    let products = [];
    menuData.forEach(cat => {
      // Produtos diretos da categoria
      if (cat.Products && Array.isArray(cat.Products)) {
        products.push(...cat.Products);
      }
      // Produtos das subcategorias
      if (cat.subcategories && Array.isArray(cat.subcategories)) {
        cat.subcategories.forEach(sub => {
          if (sub.Products && Array.isArray(sub.Products)) {
            products.push(...sub.Products);
          }
        });
      }
    });
    // Remove duplicatas por ID se houver
    return Array.from(new Map(products.map(item => [item.id, item])).values());
  }, [menuData]);

  // 2. LÓGICA DE BUSCA
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();
    const filtered = allProducts.filter(p => {
      const name = getTrans(p.name, language).toLowerCase();
      // Opcional: buscar na descrição também
      // const desc = getTrans(p.description, language).toLowerCase(); 
      return name.includes(lowerQuery);
    });

    setSearchResults(filtered);
  }, [searchQuery, allProducts, language]);

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchActive(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageSelect = (langCode) => {
    changeLanguage(langCode);
    setIsDropdownOpen(false);
  };

  const handleProductSelect = (product) => {
    setSearchQuery('');
    setIsSearchActive(false);
    if (onSearchSelect) {
      // Prepara o objeto igual ao ProductCard
      const name = getTrans(product.name, language);
      const description = getTrans(product.description, language);
      const imageUrl = product.imageUrl ? `${BASE_IMG_URL}${product.imageUrl}` : '/placeholder.png';
      
      onSearchSelect({
        ...product,
        finalName: name,
        finalDesc: description,
        finalImg: imageUrl
      });
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <Image src={logoUrl} alt="Logo" width={75} height={60} objectFit="contain" unoptimized={true} />
      </div>

      <div className={styles.rightSideGroup}>
        <div className={styles.navigation}>
          
          {/* BARRA DE BUSCA */}
          <div className={styles.searchContainer} ref={searchRef}>
            <div className={styles.searchBar}>
              <FaSearch className={styles.searchIcon} />
              <input 
                type="text" 
                placeholder={t.search[currentLang]} 
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchActive(true);
                }}
                onFocus={() => setIsSearchActive(true)}
              />
              {searchQuery && (
                <button className={styles.clearSearch} onClick={() => setSearchQuery('')}>
                  <FaTimes size={12} />
                </button>
              )}
            </div>

            {/* DROPDOWN DE RESULTADOS */}
            {isSearchActive && searchQuery && (
              <div className={styles.searchResultsDropdown}>
                {searchResults.length > 0 ? (
                  searchResults.map(product => {
                    const pName = getTrans(product.name, language);
                    const pImg = product.imageUrl ? `${BASE_IMG_URL}${product.imageUrl}` : '/placeholder.png';
                    const pPrice = parseFloat(product.price || 0);

                    return (
                      <div 
                        key={product.id} 
                        className={styles.searchResultItem}
                        onClick={() => handleProductSelect(product)}
                      >
                        <div className={styles.resultImageWrapper}>
                          <Image 
                            src={pImg} 
                            alt={pName} 
                            width={40} 
                            height={40} 
                            objectFit="cover" 
                            className={styles.resultImage}
                            unoptimized={true}
                          />
                        </div>
                        <div className={styles.resultInfo}>
                          <span className={styles.resultName}>{pName}</span>
                          <span className={styles.resultPrice}>{formatCurrency(pPrice)}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className={styles.noResults}>
                    {t.noResults[currentLang] || 'Not found'}
                  </div>
                )}
              </div>
            )}
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