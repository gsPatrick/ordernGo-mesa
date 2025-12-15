"use client";
import { useState, useEffect, useMemo } from 'react';
import styles from './AccountModal.module.css';
import { FaTimes, FaPlus, FaMinus, FaSpinner, FaBell, FaRegCreditCard, FaCreditCard, FaMoneyBillWave } from 'react-icons/fa';
import { getTrans, formatCurrency } from '@/utils/i18n';
import api from '@/lib/api';

export default function AccountModal({ isOpen, onClose, tableSessionId, language, onRequestBill }) {
  const [people, setPeople] = useState(1);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);

  // Estados da Gorjeta (Valores Fixos)
  const [tipOption, setTipOption] = useState(0); // 0, 5, 10, 15 ou 'custom'
  const [customTipValue, setCustomTipValue] = useState('');

  const t = {
    title: { br: 'MINHA CONTA', us: 'MY BILL', es: 'MI CUENTA', de: 'MEINE RECHNUNG', it: 'IL MIO CONTO', fr: 'MON ADDITION' },
    empty: { br: 'Nenhum pedido realizado.', us: 'No orders yet.', es: 'Ningún pedido realizado.' },
    headers: {
      qty: { br: 'Qtd', us: 'Qty', es: 'Cant' },
      item: { br: 'Item', us: 'Item', es: 'Artículo' },
      unit: { br: 'Unitário', us: 'Unit', es: 'Unitario' },
      val: { br: 'Valor', us: 'Value', es: 'Valor' }
    },
    sub: { br: 'Subtotal', us: 'Subtotal', es: 'Subtotal' },
    // Alterado para refletir "Gorjeta" genericamente
    tipLabel: { br: 'Gorjeta', us: 'Tip', es: 'Propina' },

    // Títulos da direita
    tipTitle: { br: 'Deseja adicionar gorjeta?', us: 'Add a tip?', es: '¿Añadir propina?' },
    custom: { br: 'Outro', us: 'Other', es: 'Otro' },
    customPlace: { br: 'Valor', us: 'Amount', es: 'Valor' },

    splitTitle: { br: 'Vai dividir a conta?', us: 'Split the bill?', es: '¿Dividir la cuenta?' },
    peopleNum: { br: 'Número de pessoas', us: 'Number of people', es: 'Número de personas' },
    perPerson: { br: 'Valor por pessoa', us: 'Value per person', es: 'Valor por persona' },

    paymentTitle: { br: 'Como vai pagar?', us: 'How will you pay?', es: '¿Cómo va a pagar?' },
    methods: {
      card: { br: 'Cartão', us: 'Card', es: 'Tarjeta' },
      cash: { br: 'Dinheiro', us: 'Cash', es: 'Efectivo' }
    },
    requestBtn: { br: 'PEDIR A CONTA', us: 'REQUEST BILL', es: 'PEDIR LA CUENTA' },
    totalPay: { br: 'Valor a pagar', us: 'Total to pay', es: 'Total a pagar' },
    continue: { br: 'CONTINUAR', us: 'CONTINUE', es: 'CONTINUAR' }
  };

  const lang = (language === 'us' || language === 'es') ? language : 'br';

  useEffect(() => {
    if (!tableSessionId) {
      setOrders([]);
      return;
    }
    if (isOpen) {
      setLoading(true);
      api.get(`/orders/session/${tableSessionId}`)
        .then(res => setOrders(res.data.data.orders))
        .catch(err => {
          console.error(err);
          if (err.response && (err.response.status === 404 || err.response.status === 400)) {
            window.location.reload();
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, tableSessionId]);

  const allItems = useMemo(() => {
    const items = [];
    orders.forEach(order => {
      if (order.status !== 'cancelled' && order.items) {
        order.items.forEach(item => {
          items.push({
            id: item.id,
            name: item.Product?.name,
            variantName: item.ProductVariant?.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.totalPrice,
          });
        });
      }
    });
    return items;
  }, [orders]);

  const calculations = useMemo(() => {
    const subtotal = allItems.reduce((sum, item) => sum + parseFloat(item.total), 0);

    let tipAmount = 0;

    if (tipOption === 'custom') {
      // Converte vírgula para ponto para cálculo seguro
      const rawValue = parseFloat(customTipValue.replace(',', '.'));
      // Validação extra: Se for NaN ou negativo, considera 0
      tipAmount = (isNaN(rawValue) || rawValue < 0) ? 0 : rawValue;
    } else {
      // Agora tipOption é o VALOR FIXO (0, 5, 10, 15)
      tipAmount = parseFloat(tipOption);
    }

    const totalValue = subtotal + tipAmount;
    const valuePerPerson = totalValue / Math.max(1, people);
    return { subtotal, tipAmount, totalValue, valuePerPerson };
  }, [allItems, people, tipOption, customTipValue]);

  // VALIDAÇÃO RÍGIDA DO INPUT
  const handleCustomTipChange = (e) => {
    let val = e.target.value;

    // 1. Bloqueia qualquer caractere que não seja número, ponto ou vírgula
    // E bloqueia sinal de menos (-) explicitamente
    val = val.replace(/[^0-9.,]/g, '');

    // 2. Limita o tamanho para evitar números gigantes (ex: max 6 caracteres: 999.99)
    if (val.length > 6) return;

    setCustomTipValue(val);
  };

  const handleRequestBill = () => {
    if (!paymentMethod) {
      alert(lang === 'us' ? 'Please select a payment method.' : (lang === 'es' ? 'Por favor, seleccione un método de pago.' : 'Por favor, selecione um método de pagamento.'));
      return;
    }
    onRequestBill(paymentMethod);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.modalOverlay} onClick={onClose}></div>
      <div className={styles.modalPanel}>
        <button className={styles.closeButton} onClick={onClose}><FaTimes size={16} /></button>

        <header className={styles.modalHeader}>
          <h3>{t.title[lang]}</h3>
        </header>

        <main className={styles.modalBody}>

          {/* ESQUERDA: Itens */}
          <div className={styles.itemsSection}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                <FaSpinner className="animate-spin text-[#df0024] text-2xl" />
              </div>
            ) : allItems.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#aaa' }}>
                <p style={{ fontSize: '1.1rem' }}>{t.empty[lang]}</p>
              </div>
            ) : (
              <>
                <div className={styles.itemsGridHeader}>
                  <span>{t.headers.qty[lang]}</span>
                  <span>{t.headers.item[lang]}</span>
                  <span style={{ textAlign: 'right' }}>{t.headers.unit[lang]}</span>
                  <span style={{ textAlign: 'right' }}>{t.headers.val[lang]}</span>
                </div>
                <ul className={styles.itemList}>
                  {allItems.map((item, idx) => (
                    <li key={`${item.id}-${idx}`} className={styles.itemRow}>
                      <span style={{ fontWeight: 'bold' }}>{item.quantity}x</span>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>{getTrans(item.name, language)} {item.variantName && `(${getTrans(item.variantName, language)})`}</span>
                      </div>
                      <span style={{ textAlign: 'right' }}>{formatCurrency(parseFloat(item.unitPrice))}</span>
                      <span style={{ textAlign: 'right' }}>{formatCurrency(parseFloat(item.total))}</span>
                    </li>
                  ))}
                </ul>
                <div className={styles.subtotalSection}>
                  <div className={styles.subRow}>
                    <span>{t.sub[lang]}</span>
                    <span>{formatCurrency(calculations.subtotal)}</span>
                  </div>
                  {/* Exibe a gorjeta se for maior que 0 */}
                  <div className={`${styles.subRow} ${styles.tipText}`}>
                    <span>{t.tipLabel[lang]}</span>
                    <span>{formatCurrency(calculations.tipAmount)}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* DIREITA: Divisão e Pagamento */}
          <div className={styles.dividerSection}>

            {/* SEÇÃO 1: GORJETA (VALORES FIXOS) */}
            <div className={styles.blockContainer}>
              <h4>{t.tipTitle[lang]}</h4>
              <div className={styles.tipGrid}>
                {/* Botão sem gorjeta */}
                <button
                  className={`${styles.tipButton} ${tipOption === 0 ? styles.selectedTip : ''}`}
                  onClick={() => { setTipOption(0); setCustomTipValue(''); }}
                >
                  <FaTimes />
                </button>

                {/* Botões de Valores Fixos: 5, 10, 15 */}
                {[5, 10, 15].map(val => (
                  <button
                    key={val}
                    className={`${styles.tipButton} ${tipOption === val ? styles.selectedTip : ''}`}
                    onClick={() => { setTipOption(val); setCustomTipValue(''); }}
                  >
                    + {val}
                  </button>
                ))}

                {/* Botão Customizado */}
                <button
                  className={`${styles.tipButton} ${tipOption === 'custom' ? styles.selectedTip : ''}`}
                  onClick={() => setTipOption('custom')}
                >
                  {t.custom[lang]}
                </button>
              </div>

              {tipOption === 'custom' && (
                <div className={styles.customInputWrapper}>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder={t.customPlace[lang]}
                    value={customTipValue}
                    onChange={handleCustomTipChange}
                    className={styles.tipInput}
                  />
                </div>
              )}
            </div>

            <div className={styles.separator}></div>

            {/* SEÇÃO 2: DIVISÃO */}
            <div className={styles.splitBlock}>
              <h4>{t.splitTitle[lang]}</h4>
              <div className={styles.splitRow}>
                <div className={styles.peopleControl}>
                  <span>{t.peopleNum[lang]}</span>
                  <div className={styles.peopleCounter}>
                    <button onClick={() => setPeople(p => Math.max(1, p - 1))}><FaMinus size={12} /></button>
                    <span>{people}</span>
                    <button onClick={() => setPeople(p => p + 1)}><FaPlus size={12} /></button>
                  </div>
                </div>
                <div className={styles.perPersonDisplay}>
                  <span>{t.perPerson[lang]}</span>
                  <span className={styles.valuePerPerson}>{formatCurrency(calculations.valuePerPerson)}</span>
                </div>
              </div>
            </div>

            <div className={styles.separator}></div>

            {/* SEÇÃO 3: PAGAMENTO */}
            <div className={styles.paymentBlock}>
              <h4>{t.paymentTitle[lang]}</h4>
              <div className={styles.paymentGrid}>
                {/* Apenas Cartão e Dinheiro (Europe Standard) */}
                <button className={`${styles.paymentOption} ${paymentMethod === 'card' ? styles.selected : ''}`} onClick={() => setPaymentMethod('card')}>
                  <FaRegCreditCard size={24} /> <span>{t.methods.card[lang]}</span>
                </button>
                <button className={`${styles.paymentOption} ${paymentMethod === 'cash' ? styles.selected : ''}`} onClick={() => setPaymentMethod('cash')}>
                  <FaMoneyBillWave size={24} /> <span>{t.methods.cash[lang]}</span>
                </button>
              </div>
            </div>

            <button
              className={styles.requestBillButton}
              onClick={handleRequestBill}
              disabled={allItems.length === 0}
              style={{ opacity: allItems.length === 0 ? 0.5 : 1, cursor: allItems.length === 0 ? 'not-allowed' : 'pointer' }}
            >
              <FaBell className="mr-2" /> {t.requestBtn[lang]}
            </button>
          </div>
        </main>

        <footer className={styles.modalFooter}>
          <div className={styles.totalValue}>
            <span>{t.totalPay[lang]}</span>
            <span>{formatCurrency(calculations.totalValue)}</span>
          </div>
          <button className={styles.submitButton} onClick={onClose}>
            {t.continue[lang]}
          </button>
        </footer>
      </div>
    </>
  );
}