// src/lib/api.js
import axios from 'axios';
import Cookies from 'js-cookie';

// URL da sua API de produção
const BASE_URL = 'https://geral-ordengoapi.r954jc.easypanel.host/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Injeta o Token da Mesa se ele existir
api.interceptors.request.use(
  (config) => {
    // O token da mesa é salvo quando o gerente escaneia o QR Code inicial
    const tableToken = Cookies.get('ordengo_table_token');
    
    // Se tiver token, mandamos no header (para rotas protegidas de mesa, se houver)
    // Ou podemos usar para identificar a sessão
    if (tableToken) {
      config.headers['x-table-token'] = tableToken;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;