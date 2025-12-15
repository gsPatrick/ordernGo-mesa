'use client';

import { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import Cookies from 'js-cookie';
import { useIdleTimer } from '@/hooks/useIdleTimer';
import styles from './Screensaver.module.css';

// URL do Backend para buscar a playlist
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://geral-ordengoapi.r954jc.easypanel.host';

export default function Screensaver() {
    const [restaurantId, setRestaurantId] = useState(null);
    const [playlist, setPlaylist] = useState([]);
    const [config, setConfig] = useState({ idleTime: 180 }); // 3 minutos padrão
    const [isActive, setIsActive] = useState(false);
    const [isFadingOut, setIsFadingOut] = useState(false);

    // Escuta evento global para ativar manualmente (ex: fim de sessão)
    useEffect(() => {
        const handleForceScreensaver = () => setIsActive(true);
        window.addEventListener('force-screensaver', handleForceScreensaver);
        return () => window.removeEventListener('force-screensaver', handleForceScreensaver);
    }, []);

    // Get restaurantId from cookies on mount
    useEffect(() => {
        const rId = Cookies.get('ordengo_restaurant_id');
        if (rId) {
            setRestaurantId(rId);
        }
    }, []);

    // Hook de inatividade
    const isIdle = useIdleTimer(config.idleTime * 1000);

    useEffect(() => {
        if (restaurantId) {
            fetchPlaylist();
        }
    }, [restaurantId]);

    useEffect(() => {
        // Só ativa se tiver playlist e estiver idle
        if (isIdle && playlist.length > 0) {
            setIsActive(true);
            setIsFadingOut(false);
        } else if (!isIdle && isActive) {
            // Se ativou por idle e usuário interagiu, faz o fluxo normal de saída
            handleInteract();
        }
    }, [isIdle, playlist]);

    const fetchPlaylist = async () => {
        try {
            // Ajuste a URL conforme sua rota (agora é /screensaver, fora do /v1 no app.js, mas vamos ver como ficou o registro)
            // No app.js registrei app.use('/api/screensaver', ...)
            // Então URL é http://host/api/screensaver/:id
            const res = await fetch(`${API_URL}/api/screensaver/${restaurantId}`);
            const data = await res.json();

            if (data.playlist) {
                setPlaylist(data.playlist);
                if (data.config) setConfig(data.config);
            }
        } catch (error) {
            console.error('Erro ao buscar screensaver:', error);
        }
    };

    const handleInteract = () => {
        setIsFadingOut(true);
        setTimeout(() => {
            setIsActive(false);
            setIsFadingOut(false);
        }, 500); // Tempo da animação CSS
    };

    if (!isActive) return null;

    return (
        <div
            className={`${styles.overlay} ${isFadingOut ? styles.fadeOut : styles.fadeIn}`}
            onClick={handleInteract}
            onTouchStart={handleInteract}
        >
            <Swiper
                modules={[Autoplay, EffectFade]}
                effect="fade"
                spaceBetween={0}
                slidesPerView={1}
                autoplay={{
                    delay: 5000, // 5 segundos por slide
                    disableOnInteraction: false,
                }}
                loop={true}
                className={styles.swiper}
            >
                {playlist.map((item, index) => (
                    <SwiperSlide key={`${item.id}-${index}`}>
                        <div className={styles.slideContainer}>
                            {item.imageUrl && (
                                <img src={item.imageUrl} alt={item.title || 'Screensaver'} className={styles.image} />
                            )}
                            {/* Opcional: Mostrar infos do SystemAd */}
                            {/* <div className={styles.info}>{item.title}</div> */}
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            <div className={styles.tapToExit}>
                Toque para iniciar
            </div>
        </div>
    );
}
