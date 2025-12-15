'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { FaCheckCircle } from 'react-icons/fa';

export default function ThankYouPage() {
    const router = useRouter();

    useEffect(() => {
        // Limpa o token da sessão, mas mantém o da mesa (QR Code) se for um tablet fixo
        // Se for cliente, o cookie de sessão já expiraria, mas forçamos a limpeza
        Cookies.remove('ordengo_session_token');
        // Não removemos ordengo_table_token pois pode ser necessário para reabrir

        // Dispara Screensaver ao carregar a página de Agradecimento
        window.dispatchEvent(new Event('force-screensaver'));
    }, []);

    const handleNewSession = () => {
        const tableToken = Cookies.get('ordengo_table_token');
        if (tableToken) {
            router.push(`/table/${tableToken}`);
        } else {
            router.push('/');
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#1f1c1d] text-white p-8 text-center">
            <FaCheckCircle size={80} className="text-green-500 mb-6" />
            <h1 className="text-3xl font-bold mb-4">Obrigado!</h1>
            <p className="text-gray-400 mb-8">
                Esperamos que tenha gostado da experiência.<br />
                Volte sempre!
            </p>

            <button
                onClick={handleNewSession}
                className="px-8 py-3 bg-[#df0024] rounded-lg font-bold hover:bg-red-700 transition-colors"
            >
                Iniciar Novo Pedido
            </button>
        </div>
    );
}
