"use client";
import styles from './SubCategoryMenu.module.css';
import { getTrans } from '@/utils/i18n';

export default function SubCategoryMenu({ subcategories, activeSubCategoryId, onSelect, language }) {
  if (!subcategories || subcategories.length === 0) return null;

  return (
    <div className={styles.container}>
      <div className={styles.scrollArea}>
        {/* Opção "Todos" para ver tudo da categoria pai */}
        <button
          className={`${styles.pill} ${activeSubCategoryId === 'all' ? styles.active : ''}`}
          onClick={() => onSelect('all')}
        >
          {language === 'br' || language === 'pt' ? 'Todos' : 'All'}
        </button>

        {subcategories.map((sub) => (
          <button
            key={sub.id}
            className={`${styles.pill} ${activeSubCategoryId === sub.id ? styles.active : ''}`}
            onClick={() => onSelect(sub.id)}
          >
            {getTrans(sub.name, language)}
          </button>
        ))}
      </div>
    </div>
  );
}