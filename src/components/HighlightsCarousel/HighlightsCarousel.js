"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Cookies from 'js-cookie';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, EffectFade } from 'swiper/modules';

// Importar os estilos do Swiper
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import 'swiper/css/effect-fade';

import styles from './HighlightsCarousel.module.css';
import api from '@/lib/api';
import { getTrans } from '@/utils/i18n';
import { useRestaurant } from '@/context/RestaurantContext';

// URL base para imagens
const BASE_IMG_URL = 'https://geral-ordengoapi.r954jc.easypanel.host';

// Slides de Fallback (Caso o restaurante não tenha configurado nada)
const DEFAULT_SLIDES = [
  { 
    id: 'default-1', 
    imageUrl: '/images/banner-gourmet.png', // Certifique-se que esta imagem existe em public/images
    title: { pt: 'BEM-VINDO', en: 'WELCOME', es: 'BIENVENIDO' }, 
    description: { pt: 'Experimente nossos pratos deliciosos.', en: 'Try our delicious dishes.', es: 'Prueba nuestros deliciosos platos.' } 
  },
  { 
    id: 'default-2', 
    imageUrl: '/images/banner-gourmet.png', 
    title: { pt: 'FAÇA SEU PEDIDO', en: 'PLACE YOUR ORDER', es: 'HAZ TU PEDIDO' }, 
    description: { pt: 'Rápido, fácil e digital.', en: 'Fast, easy and digital.', es: 'Rápido, fácil y digital.' } 
  }
];

export default function HighlightsCarousel() {
  const { language } = useRestaurant();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      const restaurantId = Cookies.get('ordengo_restaurant_id');
      if (!restaurantId) {
        setBanners(DEFAULT_SLIDES);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/marketing/public/${restaurantId}/screensavers`);
        const fetchedBanners = response.data.data.banners;
        
        if (fetchedBanners && fetchedBanners.length > 0) {
          setBanners(fetchedBanners);
        } else {
          setBanners(DEFAULT_SLIDES);
        }
      } catch (error) {
        console.error("Erro ao buscar banners:", error);
        setBanners(DEFAULT_SLIDES);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Helper para resolver URL da imagem (seja upload local ou externa)
  const getImageUrl = (path) => {
    if (!path) return '/placeholder.png';
    if (path.startsWith('http')) return path;
    return `${BASE_IMG_URL}${path}`;
  };

  if (loading) return null; // Ou um esqueleto simples

  return (
    <div className={styles.carouselContainer}>
      <Swiper
        modules={[Pagination, Autoplay, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        effect={'fade'}
        speed={1000}
        loop={banners.length > 1}
        autoplay={{
          delay: 6000,
          disableOnInteraction: false,
        }}
        pagination={{ 
          clickable: true,
          dynamicBullets: true 
        }}
        className={styles.swiper}
      >
        {banners.map(banner => (
          <SwiperSlide key={banner.id} className={styles.slide}>
            <Image
              src={getImageUrl(banner.imageUrl)}
              alt={getTrans(banner.title, language) || 'Banner'}
              layout="fill"
              objectFit="cover"
              className={styles.animatedImage}
              priority={true} // Carrega a imagem imediatamente
              unoptimized={true}
            />
            
            {/* Gradiente de proteção */}
            <div className={styles.overlay}></div>
            
            {/* Conteúdo de Texto */}
            <div className={styles.content}>
              <h1 className={styles.title}>
                {getTrans(banner.title, language)}
              </h1>
              {banner.description && (
                <p className={styles.subtitle}>
                  {getTrans(banner.description, language)}
                </p>
              )}
              
              {/* Badge de Publicidade (se for Ad do sistema) */}
              {banner.isAd && (
                <span className={styles.adBadge}>Patrocinado</span>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}