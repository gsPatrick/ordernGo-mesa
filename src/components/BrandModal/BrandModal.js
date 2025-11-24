"use client";
import { useState } from 'react';
import Image from 'next/image';
import styles from './BrandModal.module.css';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';

import { FaTimes, FaCheck } from 'react-icons/fa';

const slideData = [
  { 
    id: 'qrcode', 
    image: '/placeholder.png', 
    title: 'QR Code', 
    description: 'Pegou o celular, apontou para o QR Code e pediu! Simples assim.' 
  },
  { 
    id: 'delivery', 
    image: '/placeholder.png', 
    title: 'Delivery', 
    description: 'Sem taxas ou comissões, com pedidos via WhatsApp ou via Painel de Pedidos' 
  },
];

const featureIcons = [
  { id: 'tablet', icon: '/placeholder.png', label: 'Tablet' },
  { id: 'qrcode', icon: '/placeholder.png', label: 'QR Code' },
  { id: 'delivery', icon: '/placeholder.png', label: 'Delivery' },
  { id: 'totem', icon: '/placeholder.png', label: 'Mini Totem' },
]

export default function BrandModal({ isOpen, onClose }) {
  const [swiper, setSwiper] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!isOpen) {
    return null;
  }

  const handleNavClick = (index) => {
    if (swiper) {
      swiper.slideTo(index);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalPanel} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}><FaTimes size={18} /></button>
        
        {/* Painel Esquerdo */}
        <div className={styles.leftPanel}>
          <div className={styles.leftPanelContent}> {/* Wrapper para o conteúdo rolável */}
            <Image src="/logocolorida2.png" alt="OrdenGO Logo" width={150} height={120} objectFit="contain" />
            <h1>É mais negócio por mesa!</h1>
            <p>A OrdenGO é a inteligência que faltava no seu restaurante para você alavancar suas vendas.</p>
            <ul className={styles.featureList}>
              <li><FaCheck className={styles.checkIcon} /> Relatórios e análises de consumação dos seus clientes</li>
              <li><FaCheck className={styles.checkIcon} /> Pagamento sem contato com garçom</li>
              <li><FaCheck className={styles.checkIcon} /> Atualizações em tempo real</li>
              <li><FaCheck className={styles.checkIcon} /> Pesquisas de satisfação</li>
              <li><FaCheck className={styles.checkIcon} /> e muito mais!</li>
            </ul>
          </div>
          <div className={styles.footerLeft}>
            <p>Conheça mais sobre a OrdenGO</p>
            <a href="https://www.ordengo.com.br" target="_blank" rel="noopener noreferrer">www.ordengo.com.br</a>
            <span>1.11.2(2)</span>
          </div>
        </div>

        {/* Painel Direito */}
        <div className={styles.rightPanel}>
          {/* MUDANÇA: Wrapper para o Swiper ocupar o espaço flexível */}
          <div className={styles.swiperContainer}>
            <Swiper
              onSwiper={setSwiper}
              onSlideChange={(s) => setActiveIndex(s.activeIndex)}
              spaceBetween={0}
              slidesPerView={1}
            >
              {slideData.map(slide => (
                <SwiperSlide key={slide.id}>
                  <div className={styles.slideContent}>
                    <div className={styles.slideImageContainer}>
                       <Image src={slide.image} alt={slide.title} layout="fill" objectFit="contain" />
                    </div>
                    <h3>{slide.title}</h3>
                    <p>{slide.description}</p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
          
          <div className={styles.featureNav}>
            {featureIcons.map((feature, index) => (
              <button 
                key={feature.id} 
                className={`${styles.navButton} ${activeIndex === index ? styles.active : ''}`}
                onClick={() => handleNavClick(index)}
              >
                <Image src={feature.icon} alt={feature.label} width={30} height={30} />
                <span>{feature.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}