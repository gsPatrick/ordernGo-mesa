"use client";
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import styles from './ProductDetailModal.module.css';
import { FaTimes } from 'react-icons/fa';
import { getTrans, formatCurrency } from '@/utils/i18n';

// URL base para imagens
const BASE_IMG_URL = 'https://geral-ordengoapi.r954jc.easypanel.host';

export default function ProductDetailModal({ isOpen, onClose, product, language, onAddToCart }) {
  if (!isOpen || !product) return null;

  // 1. Traduções
  const t = {
    add: {
      br: 'ADICIONAR',
      us: 'ADD TO ORDER',
      es: 'AGREGAR',
      de: 'HINZUFÜGEN',
      it: 'AGGIUNGI',
      fr: 'AJOUTER'
    }
  };

  // Fallback de idioma
  const currentLang = t.add[language] ? language : 'us';
  const buttonText = t.add[currentLang];

  // 2. Extração de Dados Segura
  const productName = getTrans(product.name, language);
  const productDesc = getTrans(product.description, language);
  const price = parseFloat(product.price || 0);
  
  // 3. Tratamento de Imagens (Array ou Única)
  const images = [];
  
  // Se a API mandar um array de galeria (v2 future proof), usamos.
  // Senão, usamos a imageUrl padrão.
  if (product.galleryImages && product.galleryImages.length > 0) {
     images.push(...product.galleryImages.map(url => `${BASE_IMG_URL}${url}`));
  } else {
     const mainImg = product.imageUrl 
        ? `${BASE_IMG_URL}${product.imageUrl}` 
        : '/placeholder.png';
     images.push(mainImg);
  }

  // 4. Ação do Botão
  const handleAddClick = () => {
    // Fecha este modal de detalhes
    onClose();
    // Chama a função do pai que abre o modal de opções (ProductOptionsModal)
    if (onAddToCart) {
        // Passamos o produto enriquecido com os textos atuais
        onAddToCart({
            ...product,
            finalName: productName,
            finalDesc: productDesc,
            finalImg: images[0]
        });
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}><FaTimes size={22} /></button>
        
        <Swiper
          modules={[Navigation, Pagination]}
          navigation={true}
          pagination={{ clickable: true }}
          spaceBetween={0}
          slidesPerView={1}
          loop={images.length > 1}
          className={styles.swiper}
        >
          {images.map((imgUrl, index) => (
            <SwiperSlide key={index} className={styles.slide}>
              <Image
                src={imgUrl}
                alt={`${productName} - ${index}`}
                layout="fill"
                objectFit="cover"
                className={styles.animatedImage}
                unoptimized={true}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        <div className={styles.infoBar}>
          <div className={styles.infoText}>
            <h3>{productName}</h3>
            <p>{productDesc}</p>
          </div>
          
          <div className={styles.actionArea}>
             <span className={styles.priceDisplay}>
                {formatCurrency(price, 'BRL')}
             </span>
             <button className={styles.addButton} onClick={handleAddClick}>
                {buttonText}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}