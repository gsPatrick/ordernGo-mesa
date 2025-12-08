// src/app/table/[token]/page.js
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import api from '@/lib/api';
import Cookies from 'js-cookie';

export default function TableSetupPage() {
  const { token } = useParams();
  const router = useRouter();
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Conectando ao servidor...');

  useEffect(() => {
    const initializeTablet = async () => {
      if (!token) return;

      try {
        setStatus('Validando mesa...');

        // 1. Chama a rota pública que criamos no backend
        // GET /api/v1/tables/access/:token
        const response = await api.get(`/tables/access/${token}`);
        const { table, restaurant } = response.data.data;

        // 2. Salva a identidade do tablet nos Cookies (persistente por 1 ano)
        Cookies.set('ordengo_table_token', token, { expires: 365 });
        Cookies.set('ordengo_restaurant_id', restaurant.id, { expires: 365 });
        Cookies.set('ordengo_table_info', JSON.stringify({
          id: table.id,
          uuid: table.uuid, // FIX: Salva UUID para uso futuro
          number: table.number, // "10", "Terraço 1"
          restaurantName: restaurant.name,
          currency: restaurant.currency, // "BRL", "USD"
          locales: restaurant.locales // ["pt-BR", "en-US"]
        }), { expires: 365 });

        setStatus(`Sucesso! Configurado como ${restaurant.name} - Mesa ${table.number}`);

        // 3. Pequeno delay para feedback visual antes de ir para o cardápio
        setTimeout(() => {
          router.push(`/cardapio`);
        }, 1500);

      } catch (err) {
        console.error(err);
        setError('QR Code inválido, expirado ou mesa não encontrada.');
      }
    };

    initializeTablet();
  }, [token, router]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#1f1c1d] text-white p-8 text-center">
        <FaExclamationTriangle size={64} className="text-red-500 mb-6" />
        <h1 className="text-2xl font-bold mb-2">Erro de Configuração</h1>
        <p className="text-gray-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-8 px-6 py-3 bg-[#df0024] rounded-lg font-bold hover:bg-red-700 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1f1c1d] text-white">
      <div className="relative mb-8">
        <div className="w-20 h-20 border-4 border-[#df0024] border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Opcional: Colocar logo pequeno aqui no meio */}
        </div>
      </div>
      <h2 className="text-xl font-bold tracking-wide">{status}</h2>
      <p className="text-sm text-gray-500 mt-2">Não feche esta janela.</p>
    </div>
  );
}