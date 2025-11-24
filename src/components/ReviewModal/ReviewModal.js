"use client";
import { useState, useEffect } from 'react';
import styles from './ReviewModal.module.css';
import { FaTimes, FaStar, FaMusic, FaHome, FaSmile, FaUtensils, FaGlassCheers, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import api from '@/lib/api';
import Cookies from 'js-cookie';

const StarRating = ({ rating, setRating }) => {
  return (
    <div>
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <FaStar
            key={starValue}
            className={starValue <= rating ? styles.starFilled : styles.starEmpty}
            onClick={() => setRating(starValue)}
          />
        );
      })}
    </div>
  );
};

export default function ReviewModal({ isOpen, onClose, language }) {
  // Estados
  const [ratings, setRatings] = useState({ music: 5, ambience: 5, service: 5, food: 5, drink: 5 });
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [restaurantId, setRestaurantId] = useState(null);

  // Dicionário de Traduções
  const t = {
    title: { br: 'AVALIE', us: 'REVIEW', es: 'EVALUAR', de: 'BEWERTEN', it: 'VALUTA', fr: 'AVIS' },
    intro: { 
      br: 'O que você achou do nosso serviço? Deixe sua avaliação abaixo. Sua opinião é muito importante!',
      us: 'What did you think of our service? Leave your review below. Your opinion is very important!',
      es: '¿Qué te pareció nuestro servicio? Deja tu valoración abajo. ¡Tu opinión es muy importante!',
      de: 'Wie fanden Sie unseren Service? Hinterlassen Sie unten Ihre Bewertung. Ihre Meinung ist sehr wichtig!',
      it: 'Cosa ne pensi del nostro servizio? Lascia la tua recensione qui sotto. La tua opinione è molto importante!',
      fr: 'Qu\'avez-vous pensé de notre service ? Laissez votre avis ci-dessous. Votre opinion est très importante !'
    },
    labels: {
      music: { br: 'Música', us: 'Music', es: 'Música', de: 'Musik', it: 'Musica', fr: 'Musique' },
      ambience: { br: 'Ambiente', us: 'Ambience', es: 'Ambiente', de: 'Ambiente', it: 'Ambiente', fr: 'Ambiance' },
      service: { br: 'Atendimento', us: 'Service', es: 'Atención', de: 'Service', it: 'Servizio', fr: 'Service' },
      food: { br: 'Comida', us: 'Food', es: 'Comida', de: 'Essen', it: 'Cibo', fr: 'Nourriture' },
      drink: { br: 'Bebida', us: 'Drink', es: 'Bebida', de: 'Getränke', it: 'Bevande', fr: 'Boisson' }
    },
    placeholders: {
      name: { br: 'Seu nome (Opcional)', us: 'Your name (Optional)', es: 'Tu nombre (Opcional)', de: 'Ihr Name (Optional)', it: 'Il tuo nome (Opzionale)', fr: 'Votre nom (Facultatif)' },
      email: { br: 'seu@email.com (Opcional)', us: 'your@email.com (Optional)', es: 'tu@email.com (Opcional)', de: 'ihre@email.com (Optional)', it: 'tua@email.com (Opzionale)', fr: 'votre@email.com (Facultatif)' },
      phone: { br: 'Telefone (Opcional)', us: 'Phone (Optional)', es: 'Teléfono (Opcional)', de: 'Telefon (Optional)', it: 'Telefono (Opzionale)', fr: 'Téléphone (Facultatif)' },
      msg: { br: 'Escreva sua opinião, crítica ou elogio', us: 'Write your opinion, criticism or praise', es: 'Escribe tu opinión, crítica o elogio', de: 'Schreiben Sie Ihre Meinung, Kritik oder Lob', it: 'Scrivi la tua opinione, critica o elogio', fr: 'Écrivez votre opinion, critique ou éloge' },
      msgPlace: { br: 'Conte-nos sua experiência...', us: 'Tell us about your experience...', es: 'Cuéntanos tu experiencia...', de: 'Erzählen Sie uns von Ihrer Erfahrung...', it: 'Raccontaci la tua esperienza...', fr: 'Parlez-nous de votre expérience...' }
    },
    button: { br: 'ENVIAR AVALIAÇÃO', us: 'SEND REVIEW', es: 'ENVIAR EVALUACIÓN', de: 'BEWERTUNG SENDEN', it: 'INVIA RECENSIONE', fr: 'ENVOYER L\'AVIS' },
    successTitle: { br: 'Obrigado!', us: 'Thank you!', es: '¡Gracias!', de: 'Danke!', it: 'Grazie!', fr: 'Merci !' },
    successMsg: { 
      br: 'Sua opinião foi enviada com sucesso e ajuda a melhorar nosso serviço.',
      us: 'Your opinion has been sent successfully and helps to improve our service.',
      es: 'Tu opinión ha sido enviada con éxito y ayuda a mejorar nuestro servicio.',
      de: 'Ihre Meinung wurde erfolgreich gesendet und hilft, unseren Service zu verbessern.',
      it: 'La tua opinione è stata inviata con successo e aiuta a migliorare il nostro servizio.',
      fr: 'Votre avis a été envoyé avec succès et aide à améliorer notre service.'
    },
    close: { br: 'FECHAR', us: 'CLOSE', es: 'CERRAR', de: 'SCHLIEẞEN', it: 'CHIUDI', fr: 'FERMER' }
  };

  // Fallback idioma
  const lang = t.title[language] ? language : 'us';

  // Categorias de avaliação com ícones
  const reviewCategories = [
    { id: 'music', icon: <FaMusic /> },
    { id: 'ambience', icon: <FaHome /> },
    { id: 'service', icon: <FaSmile /> },
    { id: 'food', icon: <FaUtensils /> },
    { id: 'drink', icon: <FaGlassCheers /> },
  ];

  useEffect(() => {
    if (isOpen) {
      const rId = Cookies.get('ordengo_restaurant_id');
      setRestaurantId(rId);
    }
    if (!isOpen) {
        setTimeout(() => setSuccess(false), 300);
    }
  }, [isOpen]);

  const handleRatingChange = (category, value) => {
    setRatings(prev => ({ ...prev, [category]: value }));
  };

  const handleSubmit = async () => {
    if (!restaurantId) return alert("Config error.");
    setLoading(true);

    const values = Object.values(ratings);
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    const ratingGlobal = Math.round(average);

    const payload = {
        restaurantId,
        clientName: name || 'Anônimo',
        ratingGlobal,
        ratings: ratings,
        comment: message,
        contactInfo: { email, phone }
    };

    try {
        await api.post('/feedback', payload);
        setSuccess(true);
        setMessage('');
        setName('');
        setEmail('');
        setPhone('');
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={e => e.stopPropagation()}>
        {!success && <h2 className={styles.mainTitle}>{t.title[lang]}</h2>}
        
        <div className={styles.modalPanel}>
          
          {success ? (
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', minHeight: '400px'}}>
                <FaCheckCircle size={80} color="#4caf50" style={{marginBottom: '1.5rem'}} />
                <h2 style={{fontSize: '2rem', color: '#333', marginBottom: '1rem'}}>{t.successTitle[lang]}</h2>
                <p style={{fontSize: '1.1rem', color: '#666', textAlign: 'center', maxWidth: '400px'}}>
                    {t.successMsg[lang]}
                </p>
                <button className={styles.submitButton} onClick={onClose} style={{marginTop: '2rem'}}>
                    {t.close[lang]}
                </button>
            </div>
          ) : (
            <>
              {/* Esquerda */}
              <div className={styles.leftPanel}>
                <p className={styles.introText}>{t.intro[lang]}</p>
                <div className={styles.ratingsList}>
                  {reviewCategories.map(({ id, icon }) => (
                    <div key={id} className={styles.ratingItem}>
                      <div className={styles.ratingLabel}>
                        <span className={styles.iconCircle}>{icon}</span>
                        {/* Traduz o label da categoria dinamicamente */}
                        <span>{t.labels[id][lang]}</span>
                      </div>
                      <StarRating rating={ratings[id]} setRating={(value) => handleRatingChange(id, value)} />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className={styles.verticalDivider}></div>

              {/* Direita */}
              <div className={styles.rightPanel}>
                <div className={styles.inputGroup}>
                  <label>{t.placeholders.name[lang]}</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className={styles.inputGroup}>
                  <label>Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t.placeholders.email[lang]} />
                </div>
                <div className={styles.inputGroup}>
                  <label>{t.placeholders.phone[lang]}</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
                <div className={styles.inputGroup}>
                  <label>{t.placeholders.msg[lang]}</label>
                  <textarea 
                    rows="5"
                    maxLength="300"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t.placeholders.msgPlace[lang]}
                  ></textarea>
                  <span className={styles.charCounter}>{message.length}/300</span>
                </div>
                
                <button 
                    className={styles.submitButton} 
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', opacity: loading ? 0.7 : 1 }}
                >
                    {loading && <FaSpinner className="animate-spin" />}
                    {t.button[lang]}
                </button>
              </div>

              <button className={styles.closeButton} onClick={onClose} style={{top: '1rem', right: '1rem'}}>
                  <FaTimes size={18} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}