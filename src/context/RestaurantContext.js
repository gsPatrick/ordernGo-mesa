"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import api from '@/lib/api';

const RestaurantContext = createContext();

export function RestaurantProvider({ children }) {
  // Configuração Visual
  const [restaurantConfig, setRestaurantConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Estado de Idioma GLOBAL (Inicializa com 'es' - Espanhol como padrão)
  const [language, setLanguage] = useState('es');

  // Estado de Moeda (EUR como padrão para Europa)
  const [currency, setCurrency] = useState('EUR');

  // 1. Carregar Configurações
  useEffect(() => {
    const fetchSettings = async () => {
      const restaurantId = Cookies.get('ordengo_restaurant_id');
      if (!restaurantId) {
        setLoadingConfig(false);
        return;
      }

      try {
        const response = await api.get('/settings');
        const data = response.data.data;

        // O backend retorna o restaurant completo com config aninhada
        const config = data.config || data;
        setRestaurantConfig(config);

        // Extrai a moeda do restaurante (vem no nível superior ou em data.currency)
        if (data.currency) {
          setCurrency(data.currency);
        }

        console.log("Restaurant Config Loaded:", config);

        // Aplica cores CSS
        if (config) {
          const root = document.documentElement;
          if (config.primaryColor) root.style.setProperty('--primary-color', config.primaryColor);
          if (config.backgroundColor) root.style.setProperty('--background-color', config.backgroundColor);
        }
      } catch (error) {
        console.error("Erro config:", error);
      } finally {
        setLoadingConfig(false);
      }
    };
    fetchSettings();
  }, []);

  // 2. Sincronizar Idioma com Cookie ao Iniciar
  useEffect(() => {
    const savedLang = Cookies.get('ordengo_lang');
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  // Ação para trocar idioma (Atualiza estado E Cookie instantaneamente)
  const changeLanguage = (langCode) => {
    setLanguage(langCode);
    Cookies.set('ordengo_lang', langCode, { expires: 365 });
  };

  return (
    <RestaurantContext.Provider value={{
      restaurantConfig,
      loadingConfig,
      language,
      changeLanguage,
      currency
    }}>
      {children}
    </RestaurantContext.Provider>
  );
}

export const useRestaurant = () => useContext(RestaurantContext);
