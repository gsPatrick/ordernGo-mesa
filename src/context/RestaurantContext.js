"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import api from '@/lib/api';

const RestaurantContext = createContext();

export function RestaurantProvider({ children }) {
  // Configuração Visual
  const [restaurantConfig, setRestaurantConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Estado de Idioma GLOBAL (Inicializa com 'us' se não houver cookie)
  const [language, setLanguage] = useState('us'); 

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
        const config = response.data.data.config;
        setRestaurantConfig(config);
        
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
      changeLanguage 
    }}>
      {children}
    </RestaurantContext.Provider>
  );
}

export const useRestaurant = () => useContext(RestaurantContext);