"use client";
import { useState, useMemo } from 'react';
import Image from 'next/image';
import styles from './Cart.module.css';
import { FaTimes, FaPlus, FaMinus, FaSpinner } from 'react-icons/fa';
import { getTrans, formatCurrency } from '@/utils/i18n';

export default function Cart({ isOpen, onClose, cartItems, setCartItems, language, onSubmitOrder }) {
  const [loading, setLoading] = useState(false);

  // Dicionário de Tradução
  const t = {
    title: { br: 'SEU PEDIDO', us: 'YOUR ORDER', es: 'TU PEDIDO', de: 'IHRE BESTELLUNG', it: 'IL TUO ORDINE', fr: 'VOTRE COMMANDE' },
    empty: { br: 'Seu carrinho está vazio', us: 'Your cart is empty', es: 'Tu carrito está vacío', de: 'Ihr Warenkorb ist leer', it: 'Il tuo carrello è vuoto', fr: 'Votre panier est vide' },
    headers: {
      item: { br: 'Item', us: 'Item', es: 'Artículo', de: 'Artikel', it: 'Articolo', fr: 'Article' },
      qty: { br: 'Qtd', us: 'Qty', es: 'Cant', de: 'Menge', it: 'Qtà', fr: 'Qté' },
      sub: { br: 'Subtotal', us: 'Subtotal', es: 'Subtotal', de: 'Zwischensumme', it: 'Subtotale', fr: 'Sous-total' }
    },
    obs: { br: 'Obs:', us: 'Note:', es: 'Nota:', de: 'Hinweis:', it: 'Nota:', fr: 'Note:' },
    total: { br: 'Total', us: 'Total', es: 'Total', de: 'Gesamt', it: 'Totale', fr: 'Total' },
    addMore: { br: 'ADICIONAR MAIS ITENS', us: 'ADD MORE ITEMS', es: 'AÑADIR MÁS ARTÍCULOS', de: 'WEITERE ARTIKEL', it: 'AGGIUNGI ALTRO', fr: 'AJOUTER PLUS' },
    placeOrder: { br: 'ENVIAR PEDIDO', us: 'PLACE ORDER', es: 'ENVIAR PEDIDO', de: 'BESTELLEN', it: 'INVIA ORDINE', fr: 'COMMANDER' }
  };

  const lang = t.title[language] ? language : 'us';

  // Calcula total local
  const total = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.total, 0);
  }, [cartItems]);

  const handleQuantityChange = (uniqueId, delta) => {
    setCartItems(prev => prev.map(item => {
      if (item.uniqueId === uniqueId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity, total: item.price * newQuantity };
      }
      return item;
    }));
  };

  const handleRemoveItem = (uniqueId) => {
    setCartItems(prev => prev.filter(item => item.uniqueId !== uniqueId));
  };

  const handleSubmit = async () => {
    if (cartItems.length === 0) return;
    setLoading(true);
    try {
      await onSubmitOrder(cartItems);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.cartOverlay} onClick={onClose}></div>
      <div className={`${styles.cartPanel} ${isOpen ? styles.open : ''}`}>
        
        <header className={styles.cartHeader}>
          <button className={styles.closeButton} onClick={onClose}><FaTimes size={20} /></button>
          <h2>{t.title[lang]}</h2>
        </header>

        <main className={styles.cartBody}>
          {cartItems.length === 0 ? (
             <div style={{textAlign: 'center', marginTop: '3rem', color: '#888'}}>
                <p>{t.empty[lang]}</p>
             </div>
          ) : (
            <>
              <div className={styles.listHeader}>
                <span>{t.headers.item[lang]}</span>
                <span>{t.headers.qty[lang]}</span>
                <span>{t.headers.sub[lang]}</span>
              </div>
              <ul className={styles.itemList}>
                {cartItems.map(item => (
                  <li key={item.uniqueId} className={styles.cartItem}>
                    <button className={styles.removeItemButton} onClick={() => handleRemoveItem(item.uniqueId)}>
                      <FaTimes color="#888" />
                    </button>
                    
                    <div className={styles.imageWrapper}>
                        <Image src={item.finalImg} alt={item.finalName} width={70} height={70} className={styles.itemImage} objectFit="cover" unoptimized={true} />
                    </div>
                    
                    <div className={styles.itemDetails}>
                        <span className={styles.itemName}>{item.finalName}</span>
                        {item.variantName && <span className={styles.variantName}>{item.variantName}</span>}
                        {item.modifiers && item.modifiers.length > 0 && (
                            <p className={styles.modifiersList}>
                                {item.modifiers.map(m => getTrans(m.name, language)).join(', ')}
                            </p>
                        )}
                        {item.observation && <p className={styles.obs}>{t.obs[lang]} {item.observation}</p>}
                    </div>

                    <div className={styles.quantityControl}>
                      <button onClick={() => handleQuantityChange(item.uniqueId, -1)}><FaMinus size={12} /></button>
                      <span>{item.quantity}</span>
                      <button onClick={() => handleQuantityChange(item.uniqueId, 1)}><FaPlus size={12} /></button>
                    </div>
                    <span className={styles.itemSubtotal}>
                      {formatCurrency(item.total)}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </main>

        <footer className={styles.cartFooter}>
          <div className={styles.totalSection}>
            <span>{t.total[lang]}</span>
            <span className={styles.totalPrice}>
              {formatCurrency(total)}
            </span>
          </div>
          <div className={styles.footerButtons}>
            <button className={styles.addMoreButton} onClick={onClose}>
                {t.addMore[lang]}
            </button>
            <button 
                className={styles.submitButton} 
                onClick={handleSubmit}
                disabled={loading || cartItems.length === 0}
            >
                {loading && <FaSpinner className="animate-spin" />}
                {t.placeOrder[lang]}
            </button>
          </div>
        </footer>

      </div>
    </>
  );
}