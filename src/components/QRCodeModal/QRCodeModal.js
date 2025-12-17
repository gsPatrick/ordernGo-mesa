'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FaTimes, FaMobileAlt } from 'react-icons/fa';
import styles from './QRCodeModal.module.css';
import Cookies from 'js-cookie';

export default function QRCodeModal({ isOpen, onClose }) {
    const [url, setUrl] = useState('');

    // 1. Obter idioma do contexto (ou usar props se preferir, mas contexto é direto)
    // Precisamos importar useRestaurant no topo se ainda não estiver
    // Como não foi importado no arquivo original, vou adicionar a lógica de i18n local ou importar.
    // Melhor importar useRestaurant.
    const { language } = require('@/context/RestaurantContext').useRestaurant();

    useEffect(() => {
        if (isOpen) {
            const tableToken = Cookies.get('ordengo_table_token');
            if (tableToken) {
                const origin = window.location.origin;
                setUrl(`${origin}/table/${tableToken}`);
            } else {
                setUrl(window.location.href);
            }
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const t = {
        title: { br: 'Conectar Celular', us: 'Connect Mobile', es: 'Conectar Móvil', de: 'Handy Verbinden', it: 'Collega Cellulare', fr: 'Connecter Mobile' },
        desc: {
            br: 'Aponte a câmera do seu celular para o QR Code abaixo para ter o cardápio na palma da mão.',
            us: 'Point your phone camera at the QR Code below to have the menu in your hand.',
            es: 'Apunta la cámara de tu móvil al código QR de abajo para tener el menú en la palma de tu mano.',
            de: 'Richten Sie Ihre Handykamera auf den QR-Code unten, um das Menü aufzurufen.',
            it: 'Inquadra il QR Code con la fotocamera per avere il menu sul tuo cellulare.',
            fr: 'Pointez votre caméra sur le QR Code ci-dessous pour avoir le menu en main.'
        },
        scan: { br: 'Escaneie para conectar', us: 'Scan to connect', es: 'Escanear para conectar', de: 'Scannen zum Verbinden', it: 'Scansiona per collegare', fr: 'Scanner pour connecter' }
    };

    const currentLang = t.title[language] ? language : 'us';

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>
                    <FaTimes size={16} />
                </button>

                <h2 className={styles.title}>{t.title[currentLang]}</h2>
                <p className={styles.description}>
                    {t.desc[currentLang]}
                </p>

                <div className={styles.qrContainer}>
                    {url && (
                        <QRCodeSVG
                            value={url}
                            size={200}
                            level="H"
                            includeMargin={true}
                            imageSettings={{
                                src: "/logocerta.png",
                                x: undefined,
                                y: undefined,
                                height: 40,
                                width: 40,
                                excavate: true,
                            }}
                        />
                    )}
                </div>

                <div className={styles.footer}>
                    <FaMobileAlt style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
                    {t.scan[currentLang]}
                </div>
            </div>
        </div>
    );
}
