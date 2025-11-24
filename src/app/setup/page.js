// src/app/setup/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Cookies from 'js-cookie';
import { FaArrowRight, FaSpinner, FaQrcode, FaExclamationTriangle } from 'react-icons/fa';
import api from '@/lib/api';
import styles from './page.module.css';

export default function SetupPage() {
  const router = useRouter();
  const [tokenInput, setTokenInput] = useState('');
  const [error, setError] = useState('');
  const [validating, setValidating] = useState(false);
  const [currentConfig, setCurrentConfig] = useState(null);

  // Verifica se já existe uma configuração (Apenas para mostrar aviso visual, NÃO redireciona mais)
  useEffect(() => {
    const savedInfo = Cookies.get('ordengo_table_info');
    if (savedInfo) {
      try {
        setCurrentConfig(JSON.parse(savedInfo));
      } catch (e) {}
    }
  }, []);

  const handleManualSetup = async (e) => {
    e.preventDefault();
    if (!tokenInput) return;

    setValidating(true);
    setError('');

    try {
      // 1. Validar Token na API
      const response = await api.get(`/tables/access/${tokenInput.trim()}`);
      const { table, restaurant } = response.data.data;

      // 2. LIMPEZA: Remover cookies antigos para garantir uma instalação limpa
      const allCookies = ['ordengo_table_token', 'ordengo_restaurant_id', 'ordengo_table_info', 'ordengo_user', 'ordengo_token', 'ordengo_cart'];
      allCookies.forEach(cookieName => Cookies.remove(cookieName));

      // 3. SETUP: Salvar novos dados
      Cookies.set('ordengo_table_token', tokenInput.trim(), { expires: 365 });
      Cookies.set('ordengo_restaurant_id', restaurant.id, { expires: 365 });
      Cookies.set('ordengo_table_info', JSON.stringify({
        id: table.id,
        number: table.number,
        restaurantName: restaurant.name,
        currency: restaurant.currency,
        locales: restaurant.locales
      }), { expires: 365 });

      // 4. Redirecionar
      // Pequeno delay para feedback visual
      setTimeout(() => {
        router.push('/'); // Vai para a Home/Seleção de Idioma
      }, 500);

    } catch (err) {
      console.error(err);
      setError('Código de mesa inválido, expirado ou erro de conexão.');
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logoArea}>
          <Image src="/logocerta.png" alt="Logo" width={100} height={80} objectFit="contain" unoptimized={true} />
          <h1>Configuração da Mesa</h1>
          <p>Digite o código da mesa gerado no painel administrativo.</p>
        </div>

        {/* Aviso se já estiver configurado */}
        {currentConfig && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6 text-left text-sm text-yellow-800 flex items-start gap-3">
            <FaExclamationTriangle className="mt-1 flex-shrink-0" />
            <div>
              <strong>Atenção:</strong> Este dispositivo já está configurado como 
              <span className="font-bold block text-yellow-900">{currentConfig.restaurantName} - Mesa {currentConfig.number}</span>
              Ao continuar, você sobrescreverá esta configuração.
            </div>
          </div>
        )}

        <form onSubmit={handleManualSetup} className={styles.form}>
          <div className={styles.inputGroup}>
            <FaQrcode className={styles.inputIcon} />
            <input 
              type="text" 
              placeholder="Token da Mesa" 
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className={styles.input}
              autoFocus
            />
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <button type="submit" className={styles.button} disabled={validating || !tokenInput}>
            {validating ? <FaSpinner className={styles.spin} /> : <>Vincular Mesa <FaArrowRight /></>}
          </button>
        </form>
      </div>
    </div>
  );
}