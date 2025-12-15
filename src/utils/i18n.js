// src/utils/i18n.js

export const getTrans = (obj, lang = 'br') => {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;

  // Mapeamento: Frontend (Bandeiras) -> Backend (JSONB)
  const map = {
    'br': 'pt',
    'us': 'en',
    'es': 'es',
    'de': 'de', // Alemão
    'it': 'it', // Italiano
    'fr': 'fr'  // Francês
  };

  const apiLang = map[lang] || 'pt';

  // Tenta idioma exato > Tenta Inglês > Tenta Português > Pega o primeiro que tiver
  return obj[apiLang] || obj['en'] || obj['pt'] || Object.values(obj)[0] || '';
};

export const formatCurrency = (value, currency = 'EUR') => {
  // Mapa de moeda para locale apropriado
  const localeMap = {
    'EUR': 'es-ES',  // Espanha/Europa
    'BRL': 'pt-BR',  // Brasil
    'USD': 'en-US',  // Estados Unidos
    'GBP': 'en-GB',  // Reino Unido
  };

  const locale = localeMap[currency] || 'es-ES';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(value || 0);
};
