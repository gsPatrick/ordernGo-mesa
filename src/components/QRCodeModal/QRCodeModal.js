'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FaTimes, FaMobileAlt } from 'react-icons/fa';
import styles from './QRCodeModal.module.css';
import Cookies from 'js-cookie';

export default function QRCodeModal({ isOpen, onClose }) {
    const [url, setUrl] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Reconstrói a URL completa para esta mesa usando o token original
            // Isso garante que o celular passe pelo processo de login/validação
            const tableToken = Cookies.get('ordengo_table_token');
            if (tableToken) {
                const origin = window.location.origin;
                setUrl(`${origin}/table/${tableToken}`);
            } else {
                // Fallback (não deve acontecer se o fluxo estiver correto)
                setUrl(window.location.href);
            }
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>
                    <FaTimes size={16} />
                </button>

                <h2 className={styles.title}>Conectar Celular</h2>
                <p className={styles.description}>
                    Aponte a câmera do seu celular para o QR Code abaixo para ter o cardápio na palma da mão.
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
                    Escaneie para conectar
                </div>
            </div>
        </div>
    );
}
