'use client';

import { useEffect, useState } from 'react';
import { FaMobileAlt } from 'react-icons/fa';

export default function OrientationGuard() {
    const [isPortrait, setIsPortrait] = useState(false);

    useEffect(() => {
        const checkOrientation = () => {
            // Verifica se a altura é maior que a largura
            if (window.innerHeight > window.innerWidth) {
                setIsPortrait(true);
            } else {
                setIsPortrait(false);
            }
        };

        // Checa ao montar
        checkOrientation();

        // Event listeners
        window.addEventListener('resize', checkOrientation);
        window.addEventListener('orientationchange', checkOrientation);

        return () => {
            window.removeEventListener('resize', checkOrientation);
            window.removeEventListener('orientationchange', checkOrientation);
        };
    }, []);

    if (!isPortrait) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: '#1f1c1d',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            padding: '2rem',
            textAlign: 'center'
        }}>
            <FaMobileAlt size={64} style={{ marginBottom: '20px', transform: 'rotate(90deg)' }} />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '10px', color: '#df0024' }}>
                Por favor, gire seu dispositivo
            </h1>
            <p style={{ color: '#9ca3af' }}>
                Este aplicativo foi desenvolvido para ser utilizado na horizontal (modo paisagem).
            </p>
        </div>
    );
}
