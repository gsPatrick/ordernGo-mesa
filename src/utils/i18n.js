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

export const formatCurrency = (value, currency = 'BRL') => {
  // Tratamento básico para moedas europeias/americanas se necessário no futuro
  // Por enquanto, formata baseado no locale pt-BR mas com o símbolo da moeda do restaurante
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: currency 
  }).format(value || 0);
};