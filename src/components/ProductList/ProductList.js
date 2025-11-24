import Image from 'next/image';
import ProductCard from '../ProductCard/ProductCard';
import styles from './ProductList.module.css';
import { getTrans } from '@/utils/i18n';

// URL base para imagens
const BASE_IMG_URL = 'https://geral-ordengoapi.r954jc.easypanel.host';

export default function ProductList({ products, category, onProductClick, onAddToCartClick, language }) {
  
  const t = {
    subtitle: {
      br: 'Selecione os itens desejados para adicionar ao seu pedido.',
      us: 'Select the items you wish to add to your order.',
      es: 'Seleccione los artículos que desea añadir a su pedido.',
      de: 'Wählen Sie die Artikel aus, die Sie Ihrer Bestellung hinzufügen möchten.',
      it: 'Seleziona gli articoli da aggiungere al tuo ordine.',
      fr: 'Sélectionnez les articles à ajouter à votre commande.'
    },
    empty: {
        br: 'Nenhum produto encontrado nesta categoria.',
        us: 'No products found in this category.',
        es: 'No se encontraron productos en esta categoría.'
    }
  };

  // Lógica do Banner
  let bannerUrl = '/images/banner-gourmet.png'; 
  
  if (category) {
      if (category.banners && category.banners.length > 0) {
          bannerUrl = `${BASE_IMG_URL}${category.banners[0]}`;
      } else if (category.image) {
          bannerUrl = `${BASE_IMG_URL}${category.image}`;
      }
  }

  const categoryName = category ? getTrans(category.name, language) : '';

  // Fallback para idioma no ProductList também
  const currentLang = language || 'br';

  return (
    <div className={styles.productListContainer}>
      
      {/* Banner da Categoria */}
      <div className={styles.categoryBanner}>
        <Image
          src={bannerUrl}
          alt={categoryName}
          layout="fill"
          objectFit="cover"
          className={styles.bannerImage}
          unoptimized={true}
        />
        <div className={styles.bannerOverlay}></div>
        <div className={styles.bannerContent}>
          <h1 className={styles.bannerTitle}>{categoryName || 'Menu'}</h1>
          <p className={styles.bannerDescription}>
            {getTrans(t.subtitle, currentLang)}
          </p>
        </div>
      </div>

      {/* Lista de Produtos */}
      {(!products || products.length === 0) ? (
         <div style={{textAlign:'center', padding:'4rem', color:'#888'}}>
            <p>{getTrans(t.empty, currentLang)}</p>
         </div>
      ) : (
        <div className={styles.cardsWrapper}>
            {products.map(product => (
            <ProductCard 
                key={product.id} 
                product={product} 
                language={currentLang} // <--- REPASSANDO O IDIOMA
                onImageClick={onProductClick} 
                onAddToCartClick={onAddToCartClick} 
            />
            ))}
        </div>
      )}
    </div>
  );
}