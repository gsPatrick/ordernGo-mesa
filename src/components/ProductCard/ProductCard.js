import Image from 'next/image';
import styles from './ProductCard.module.css';
import { getTrans, formatCurrency } from '@/utils/i18n';
import { useRestaurant } from '@/context/RestaurantContext';

export default function ProductCard({ product, onImageClick, onAddToCartClick, language }) {
  const { currency } = useRestaurant();

  // Dicionário de tradução para o botão
  const t = {
    add: {
      br: 'ADICIONAR',
      pt: 'ADICIONAR',
      us: 'ADD',
      en: 'ADD',
      es: 'AGREGAR',
      de: 'HINZUFÜGEN',
      it: 'AGGIUNGI',
      fr: 'AJOUTER'
    }
  };

  // Garante um fallback para 'br' se o idioma não for encontrado
  const currentLang = t.add[language] ? language : 'br';
  const buttonText = t.add[currentLang] || 'ADICIONAR';

  // Extração segura dos dados traduzidos
  const name = getTrans(product.name, language);
  const description = getTrans(product.description, language);
  const price = parseFloat(product.price || 0);

  const imageUrl = product.imageUrl
    ? `https://geral-ordengoapi.r954jc.easypanel.host${product.imageUrl}`
    : '/placeholder.png';

  // Objeto enriquecido para passar aos modais
  const productPayload = {
    ...product,
    finalName: name,
    finalDesc: description,
    finalImg: imageUrl
  };

  return (
    <div className={styles.card}>
      <button className={styles.imageButton} onClick={() => onImageClick(productPayload)}>
        <div className={styles.imageContainer}>
          <Image
            src={imageUrl}
            alt={name}
            layout="fill"
            objectFit="cover"
            className={styles.animatedImage}
            unoptimized={true}
          />
        </div>
      </button>

      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>{name}</h3>
          <div className={styles.priceContainer}>
            <span className={styles.price}>{formatCurrency(price, currency)}</span>
          </div>
        </div>
        <p className={styles.description}>{description}</p>
        <div className={styles.actions}>
          <button
            className={styles.addButton}
            onClick={() => onAddToCartClick(productPayload)}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
