"use client";
import { useState, useEffect, useMemo } from 'react';
import styles from './AccountModal.module.css';
import { FaTimes, FaPlus, FaMinus, FaSpinner, FaBell, FaRegCreditCard, FaCreditCard, FaQrcode, FaMoneyBillWave } from 'react-icons/fa';
import { getTrans, formatCurrency } from '@/utils/i18n';
import api from '@/lib/api';

export default function AccountModal({ isOpen, onClose, tableSessionId, language, onRequestBill }) {
  const [people, setPeople] = useState(1);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);

  // ... (Dicionário de Traduções 't' permanece igual) ...
  const t = {
    title: { br: 'MINHA CONTA', us: 'MY BILL', es: 'MI CUENTA', de: 'MEINE RECHNUNG', it: 'IL MIO CONTO', fr: 'MON ADDITION' },
    empty: { br: 'Nenhum pedido realizado ou conta fechada.', us: 'No orders yet or bill closed.', es: 'Ningún pedido realizado o cuenta cerrada.' },
    headers: {
      qty: { br: 'Qtd', us: 'Qty', es: 'Cant' },
      item: { br: 'Item', us: 'Item', es: 'Artículo' },
      unit: { br: 'Unitário', us: 'Unit', es: 'Unitario' },
      val: { br: 'Valor', us: 'Value', es: 'Valor' }
    },
    status: {
      del: { br: 'Entregue', us: 'Delivered', es: 'Entregado' },
      prep: { br: 'Preparo', us: 'Preparing', es: 'Preparando' }
    },
    sub: { br: 'Subtotal', us: 'Subtotal', es: 'Subtotal' },
    tax: { br: 'Taxa de serviço (10%)', us: 'Service fee (10%)', es: 'Tarifa de servicio (10%)' },
    splitTitle: { br: 'Vai dividir a conta?', us: 'Split the bill?', es: '¿Dividir la cuenta?' },
    peopleNum: { br: 'Número de pessoas', us: 'Number of people', es: 'Número de personas' },
    perPerson: { br: 'Valor por pessoa', us: 'Value per person', es: 'Valor por persona' },
    paymentTitle: { br: 'Como vai pagar?', us: 'How will you pay?', es: '¿Cómo va a pagar?' },
    methods: {
      credit: { br: 'Crédito', us: 'Credit', es: 'Crédito' },
      debit: { br: 'Débito', us: 'Debit', es: 'Débito' },
      pix: { br: 'Pix', us: 'Pix', es: 'Pix' },
      cash: { br: 'Dinheiro', us: 'Cash', es: 'Efectivo' }
    },
    requestBtn: { br: 'PEDIR A CONTA', us: 'REQUEST BILL', es: 'PEDIR LA CUENTA' },
    totalPay: { br: 'Valor a pagar', us: 'Total to pay', es: 'Total a pagar' },
    continue: { br: 'CONTINUAR', us: 'CONTINUE', es: 'CONTINUAR' }
  };

  const lang = language === 'us' || language === 'es' ? language : 'br';

  // --- CORREÇÃO 2: Verificação Ativa de Sessão ---
  useEffect(() => {
    // Se não tem ID de sessão, nem tenta buscar, limpa e fecha
    if (!tableSessionId) {
      setOrders([]);
      return;
    }

    if (isOpen) {
      setLoading(true);
      
      api.get(`/orders/session/${tableSessionId}`)
        .then(res => {
          // Se tiver sucesso, seta os pedidos
          setOrders(res.data.data.orders);
        })
        .catch(err => {
          console.error("Erro ao buscar pedidos:", err);
          
          // Se der erro 404 ou 400, significa que a sessão não existe mais ou foi fechada
          // Forçamos um reload da página para o tablet voltar ao estado "Limpo"
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
                    status: order.status
                });
            });
        }
    });
    return items;
  }, [orders]);

  const calculations = useMemo(() => {
    const subtotal = allItems.reduce((sum, item) => sum + parseFloat(item.total), 0);
    const serviceTax = subtotal * 0.10;
    const totalValue = subtotal + serviceTax;
    const valuePerPerson = totalValue / Math.max(1, people);
    return { subtotal, serviceTax, totalValue, valuePerPerson };
  }, [allItems, people]);

  const handleRequestBill = () => {
    if (!paymentMethod) {
        alert(lang === 'us' ? 'Please select a payment method.' : 'Por favor, selecione um método de pagamento.');
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
                        <span style={{textAlign: 'right'}}>{t.headers.unit[lang]}</span>
                        <span style={{textAlign: 'right'}}>{t.headers.val[lang]}</span>
                    </div>
                    <ul className={styles.itemList}>
                    {allItems.map(item => (
                        <li key={item.id} className={styles.itemRow}>
                            <span style={{fontWeight: 'bold'}}>{item.quantity}x</span>
                            <div style={{display: 'flex', flexDirection: 'column'}}>
                                <span>{getTrans(item.name, language)} {item.variantName && `(${getTrans(item.variantName, language)})`}</span>
                                <span style={{fontSize: '0.7rem', color: '#aaa', textTransform: 'uppercase'}}>
                                    {item.status === 'delivered' ? t.status.del[lang] : t.status.prep[lang]}
                                </span>
                            </div>
                            <span style={{textAlign: 'right'}}>{formatCurrency(parseFloat(item.unitPrice))}</span>
                            <span style={{textAlign: 'right'}}>{formatCurrency(parseFloat(item.total))}</span>
                        </li>
                    ))}
                    </ul>
                    <div className={styles.subtotalSection}>
                        <div><span>{t.sub[lang]}</span><span>{formatCurrency(calculations.subtotal)}</span></div>
                        <div><span>{t.tax[lang]}</span><span>{formatCurrency(calculations.serviceTax)}</span></div>
                    </div>
                </>
            )}
          </div>

          {/* DIREITA: Divisão e Pagamento */}
          <div className={styles.dividerSection}>
            
            <div className={styles.splitBlock}>
                <h4>{t.splitTitle[lang]}</h4>
                <p>{t.peopleNum[lang]}</p>
                <div className={styles.peopleCounter}>
                    <button onClick={() => setPeople(p => Math.max(1, p - 1))}><FaMinus size={14} /></button>
                    <span>{people}</span>
                    <button onClick={() => setPeople(p => p + 1)}><FaPlus size={14} /></button>
                </div>
                <p>{t.perPerson[lang]}</p>
                <span className={styles.valuePerPerson}>{formatCurrency(calculations.valuePerPerson)}</span>
            </div>

            <div className={styles.separator}></div>

            <div className={styles.paymentBlock}>
                <h4>{t.paymentTitle[lang]}</h4>
                <div className={styles.paymentGrid}>
                    <button className={`${styles.paymentOption} ${paymentMethod === 'credit' ? styles.selected : ''}`} onClick={() => setPaymentMethod('credit')}>
                        <FaRegCreditCard size={24} /> <span>{t.methods.credit[lang]}</span>
                    </button>
                    <button className={`${styles.paymentOption} ${paymentMethod === 'debit' ? styles.selected : ''}`} onClick={() => setPaymentMethod('debit')}>
                        <FaCreditCard size={24} /> <span>{t.methods.debit[lang]}</span>
                    </button>
                    <button className={`${styles.paymentOption} ${paymentMethod === 'pix' ? styles.selected : ''}`} onClick={() => setPaymentMethod('pix')}>
                        <FaQrcode size={24} /> <span>Pix</span>
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