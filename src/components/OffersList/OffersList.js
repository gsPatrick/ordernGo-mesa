"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Cookies from 'js-cookie';
import styles from './OffersList.module.css';
import { FaClock, FaCalendarAlt, FaSpinner, FaPercentage } from 'react-icons/fa';
import { Megaphone } from 'lucide-react'; // Usando Lucide para o ícone de destaque
import api from '@/lib/api';
import { getTrans, formatCurrency } from '@/utils/i18n';
import { useRestaurant } from '@/context/RestaurantContext';

// URL base para imagens
const BASE_IMG_URL = 'https://geral-ordengoapi.r954jc.easypanel.host';

export default function OffersList() {
  const { language } = useRestaurant();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentLang = language || 'br';

  // Dicionário de tradução local atualizado
  const t = {
    // Textos para o Empty State (Banner)
    emptyTitle: {
      br: 'SEM OFERTAS NO MOMENTO',
      us: 'NO OFFERS AT THE MOMENT',
      es: 'NO HAY OFERTAS AL MOMENTO',
      de: 'KEINE ANGEBOTE IM MOMENT',
      it: 'NESSUNA OFFERTA AL MOMENTO',
      fr: 'AUCUNE OFFRE POUR LE MOMENT'
    },
    emptyDesc: {
      br: 'Fique de olho! Nossas melhores promoções aparecem aqui. Enquanto isso, aproveite as delícias do nosso cardápio principal.',
      us: 'Keep an eye out! Our best promotions appear here. Meanwhile, enjoy the delights of our main menu.',
      es: '¡Esté atento! Nuestras mejores promociones aparecen aquí. Mientras tanto, disfrute de las delicias de nuestro menú principal.'
    },
    // Textos dos Cards
    available: { br: 'DISPONÍVEL AGORA', us: 'AVAILABLE NOW', es: 'DISPONIBLE AHORA' },
    unavailable: { br: 'INDISPONÍVEL AGORA', us: 'UNAVAILABLE NOW', es: 'NO DISPONIBLE AHORA' },
    off: { br: 'OFF', us: 'OFF', es: 'DCTO' }
  };

  useEffect(() => {
    const fetchPromotions = async () => {
      const restaurantId = Cookies.get('ordengo_restaurant_id');
      if (!restaurantId) return;

      try {
        const response = await api.get(`/marketing/public/${restaurantId}/promotions`);
        setPromotions(response.data.data.promotions);
      } catch (error) {
        console.error("Erro ao buscar promoções:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  const isPromoActiveNow = (promo) => {
    const now = new Date();
    const currentDay = now.getDay();

    if (!promo.activeDays.includes(currentDay)) return false;

    const currentTime = now.toTimeString().slice(0, 5);
    const start = promo.startTime?.slice(0, 5) || "00:00";
    const end = promo.endTime?.slice(0, 5) || "23:59";

    if (end < start) {
      return currentTime >= start || currentTime <= end;
    }
    return currentTime >= start && currentTime <= end;
  };

  const formatDays = (days) => {
    if (days.length === 7) return currentLang === 'us' ? 'Every day' : (currentLang === 'es' ? 'Todos los días' : 'Todos os dias');
    const map = {
      br: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
      us: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      es: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    };
    const labels = map[currentLang] || map.br;
    return days.map(d => labels[d]).join(', ');
  };

  if (loading) {
    return <div className={styles.loading}><FaSpinner className="animate-spin text-[#df0024] text-3xl" /></div>;
  }

  // --- RENDERIZAÇÃO ---

  if (promotions.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyBanner}>
          <div className={styles.iconCircle}>
            <Megaphone size={64} strokeWidth={1.5} />
          </div>
          <h2 className={styles.emptyTitle}>{t.emptyTitle[currentLang]}</h2>
          <p className={styles.emptyDescription}>{t.emptyDesc[currentLang]}</p>

          {/* Elemento decorativo de fundo */}
          <div className={styles.bgDecoration}>
            <FaPercentage size={300} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {promotions.map((promo) => {
          const active = isPromoActiveNow(promo);
          const imageUrl = promo.imageUrl ? `${BASE_IMG_URL}${promo.imageUrl}` : '/placeholder.png';

          return (
            <div key={promo.id} className={`${styles.card} ${!active ? styles.disabledCard : ''}`}>

              <div className={styles.imageContainer}>
                <Image
                  src={imageUrl}
                  alt={getTrans(promo.title, currentLang)}
                  layout="fill"
                  objectFit="cover"
                  className={styles.image}
                  unoptimized={true}
                />
                <div className={styles.discountBadge}>
                  {promo.discountType === 'percentage' ? (
                    <>
                      <span className={styles.discountValue}>{parseInt(promo.discountValue)}%</span>
                      <span className={styles.discountLabel}>{t.off[currentLang]}</span>
                    </>
                  ) : (
                    <>
                      <span className={styles.discountLabel}>-</span>
                      <span className={styles.discountValue}>{formatCurrency(promo.discountValue)}</span>
                    </>
                  )}
                </div>
              </div>

              <div className={styles.content}>
                <div className={styles.header}>
                  <h3 className={styles.title}>{getTrans(promo.title, currentLang)}</h3>
                  <span className={`${styles.statusBadge} ${active ? styles.activeBadge : styles.inactiveBadge}`}>
                    {active ? t.available[currentLang] : t.unavailable[currentLang]}
                  </span>
                </div>

                <div className={styles.rules}>
                  <div className={styles.ruleRow}>
                    <FaCalendarAlt className={styles.icon} />
                    <span>{formatDays(promo.activeDays)}</span>
                  </div>
                  <div className={styles.ruleRow}>
                    <FaClock className={styles.icon} />
                    <span>{promo.startTime.slice(0, 5)} - {promo.endTime.slice(0, 5)}</span>
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}