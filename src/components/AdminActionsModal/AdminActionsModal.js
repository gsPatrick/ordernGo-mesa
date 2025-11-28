"use client";
import styles from './AdminActionsModal.module.css';
import { FaExclamationTriangle, FaTimes, FaSignOutAlt } from 'react-icons/fa';

export default function AdminActionsModal({ isOpen, onClose, onUnbind, language }) {
  if (!isOpen) return null;

  const t = {
    title: { br: 'Menu de Manutenção', es: 'Menú de Mantenimiento', us: 'Maintenance Menu' },
    desc: { 
      br: 'Ações administrativas do dispositivo. Cuidado, estas opções afetam a operação da mesa.', 
      es: 'Acciones administrativas del dispositivo. Tenga cuidado, estas opciones afectan la operación de la mesa.', 
      us: 'Device administrative actions. Be careful, these options affect table operation.' 
    },
    unbind: { br: 'Desvincular Tablet', es: 'Desvincular Tablet', us: 'Unbind Tablet' },
    info: { 
      br: 'O dispositivo voltará para a tela de configuração inicial.', 
      es: 'El dispositivo volverá a la pantalla de configuración inicial.', 
      us: 'The device will return to the initial setup screen.' 
    }
  };

  const lang = (language === 'es' || language === 'us') ? language : 'br';

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <FaTimes />
        </button>
        
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <FaExclamationTriangle size={32} />
          </div>
          <h2>{t.title[lang]}</h2>
        </div>
        
        <p className={styles.description}>
          {t.desc[lang]}
        </p>
        
        <div className={styles.actions}>
          <button className={styles.unbindButton} onClick={onUnbind}>
            <FaSignOutAlt />
            <span>{t.unbind[lang]}</span>
          </button>
        </div>
        
        <p className={styles.info}>
           {t.info[lang]}
        </p>
      </div>
    </div>
  );
}