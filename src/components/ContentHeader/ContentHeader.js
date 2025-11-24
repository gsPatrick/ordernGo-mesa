"use client";
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './ContentHeader.module.css';
import { FaSearch } from 'react-icons/fa';
import { IoIosArrowDown } from 'react-icons/io';

const languages = {
  br: { name: 'Brasil', flag: '/flags/br.png' },
  us: { name: 'USA', flag: '/flags/us.png' },
  es: { name: 'España', flag: '/flags/es.png' },
};

export default function ContentHeader() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('br');
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleLanguageSelect = (langCode) => {
    setSelectedLang(langCode);
    setIsDropdownOpen(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.searchBar}>
        <FaSearch color="#3163f3" />
        <input type="text" placeholder="BUSCAR" className={styles.searchInput} />
      </div>
      
      <div className={styles.divider}></div>
      
      <div className={styles.tableInfo}>
        <span>MESA 29</span>
      </div>
      
      <div className={styles.divider}></div>

      <div className={styles.languageSelectorWrapper} ref={dropdownRef}>
        <div className={styles.languageSelector} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
          <Image src={languages[selectedLang].flag} alt="Idioma" width={24} height={24} className={styles.flagImage} />
          <IoIosArrowDown color="#ccc" />
        </div>

        {isDropdownOpen && (
          <div className={styles.dropdownMenu}>
            {Object.keys(languages)
              .filter((lang) => lang !== selectedLang)
              .map((langCode) => (
                <div key={langCode} className={styles.dropdownItem} onClick={() => handleLanguageSelect(langCode)}>
                  <Image src={languages[langCode].flag} alt={languages[langCode].name} width={24} height={24} className={styles.flagImage} />
                  <span>{languages[langCode].name}</span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}