"use client";
import styles from './WaiterModal.module.css';
import { FaCheckCircle, FaTimes } from 'react-icons/fa';
import { BiHappyBeaming } from 'react-icons/bi';

export default function WaiterModal({ isOpen, onClose, language }) {
  if (!isOpen) return null;

  // Textos traduzidos
  const texts = {
    title: {
      br: 'Chamado Recebido!',
      us: 'Request Received!',
      es: '¡Solicitud Recibida!'
    },
    message: {
      br: 'O garçom já foi notificado e está a caminho da sua mesa.',
      us: 'The waiter has been notified and is on the way to your table.',
      es: 'El camarero ha sido notificado y está en camino a su mesa.'
    },
    button: {
      br: 'Obrigado',
      us: 'Thank you',
      es: 'Gracias'
    }
  };

  // Fallback para idioma
  const lang = (language === 'br' || language === 'pt') ? 'br' : (language === 'es' ? 'es' : 'us');

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <FaTimes />
        </button>
        
        <div className={styles.content}>
          <div className={styles.iconContainer}>
             {/* Ícone animado de sucesso/feliz */}
             <BiHappyBeaming size={80} className={styles.icon} />
             <div className={styles.checkBadge}>
               <FaCheckCircle size={24} />
             </div>
          </div>
          
          <h2 className={styles.title}>{texts.title[lang]}</h2>
          <p className={styles.message}>{texts.message[lang]}</p>
          
          <button className={styles.confirmButton} onClick={onClose}>
            {texts.button[lang]}
          </button>
        </div>
      </div>
    </div>
  );
}