// components/CategoryMenu/CategoryMenu.js
"use client";
import styles from './CategoryMenu.module.css';
import { getTrans } from '@/utils/i18n';

export default function CategoryMenu({ categories, activeCategoryId, onCategorySelect, language }) {
  
  if (!categories || categories.length === 0) {
    return <nav className={styles.categoryMenu}><p style={{color:'#888', textAlign:'center', marginTop:'2rem'}}>Carregando...</p></nav>;
  }

  return (
    <nav className={styles.categoryMenu}>
      <ul className={styles.categoryList}>
        {categories.map((category) => (
          <li key={category.id}>
            <button
              className={`${styles.categoryButton} ${
                activeCategoryId === category.id ? styles.active : ''
              }`}
              onClick={() => onCategorySelect(category.id)}
            >
              {getTrans(category.name, language)}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}