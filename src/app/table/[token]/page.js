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
    const initializeSession = async () => {
      if (!token) return;

      try {
        setStatus('Validando mesa...');

        // 1. Busca dados da mesa
        const response = await api.get(`/tables/access/${token}`);
        const { table, restaurant } = response.data.data;

        setStatus('Iniciando sessão...');

        // 2. Verifica se já existe sessão ativa ou cria uma nova
        let sessionToken = table.activeSession?.sessionToken;

        if (!sessionToken) {
          // Cria nova sessão
          const sessionRes = await api.post('/orders/session/start', {
            restaurantId: restaurant.id,
            tableId: table.uuid
          });
          sessionToken = sessionRes.data.data.session.sessionToken;
        }

        // 3. Salva o token da sessão (Cookie de Sessão - expira ao fechar navegador)
        Cookies.set('ordengo_session_token', sessionToken);

        // Salva o token da MESA (QR Code) também, para o CardapioPage usar
        Cookies.set('ordengo_table_token', token); // Session cookie (no expires)

        // Salva ID do restaurante para contexto
        Cookies.set('ordengo_restaurant_id', restaurant.id);

        // Salva info da mesa para exibição (opcional)
        Cookies.set('ordengo_table_info', JSON.stringify({
          id: table.id,
          uuid: table.uuid,
          number: table.number,
          restaurantName: restaurant.name,
          currency: restaurant.currency,
          locales: restaurant.locales
        }));

        setStatus(`Mesa ${table.number} aberta! Redirecionando...`);

        // 4. Redireciona para o cardápio
        setTimeout(() => {
          router.push(`/cardapio`);
        }, 1000);

      } catch (err) {
        console.error(err);
        setError('Não foi possível abrir a mesa. Tente novamente ou chame o garçom.');
      }
    };

    initializeSession();
  }, [token, router]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#1f1c1d] text-white p-8 text-center">
        <FaExclamationTriangle size={64} className="text-red-500 mb-6" />
        <h1 className="text-2xl font-bold mb-2">Erro</h1>
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
      </div>
      <h2 className="text-xl font-bold tracking-wide">{status}</h2>
    </div>
  );
}