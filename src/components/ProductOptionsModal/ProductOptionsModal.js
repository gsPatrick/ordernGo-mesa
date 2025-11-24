"use client";
import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import styles from './ProductOptionsModal.module.css';
import { FaTimes, FaPlus, FaMinus, FaCheck } from 'react-icons/fa';
import { getTrans, formatCurrency } from '@/utils/i18n';

export default function ProductOptionsModal({ isOpen, onClose, product, language, onConfirm }) {
  // 1. Hooks Incondicionais
  const [quantity, setQuantity] = useState(1);
  const [observation, setObservation] = useState('');
  const [selections, setSelections] = useState({}); 
  const [selectedVariant, setSelectedVariant] = useState(null); 

  // Resetar estados ao abrir
  useEffect(() => {
    if (isOpen && product) {
      setQuantity(1);
      setObservation('');
      setSelections({});
      setSelectedVariant(null);
      
      // Pré-seleciona variante se só houver uma
      if (product.variants && product.variants.length === 1) {
          setSelectedVariant(product.variants[0]);
      }
    }
  }, [isOpen, product]);

  // Preparação de dados seguros
  const safeProduct = product || {};
  const modifierGroups = safeProduct.modifierGroups || [];
  const variants = safeProduct.variants || [];
  const hasVariants = variants.length > 0;
  const basePrice = parseFloat(safeProduct.price || 0);

  // Cálculo de Preço
  const totalPrice = useMemo(() => {
    let finalBase = basePrice;
    
    if (selectedVariant) {
        finalBase = parseFloat(selectedVariant.price || 0);
    }

    let modifiersCost = 0;
    Object.values(selections).forEach(selectedItems => {
      if (Array.isArray(selectedItems)) {
        selectedItems.forEach(item => modifiersCost += parseFloat(item.price || 0));
      }
    });

    return (finalBase + modifiersCost) * quantity;
  }, [basePrice, selectedVariant, selections, quantity]);

  // Return Condicional (após os hooks)
  if (!isOpen || !product) return null;

  // Textos e Imagem
  const productName = product.finalName || getTrans(product.name, language);
  const productDesc = product.finalDesc || getTrans(product.description, language);
  
  const imageSrc = (product.finalImg && product.finalImg !== "") 
    ? product.finalImg 
    : (product.imageUrl 
        ? `https://geral-ordengoapi.r954jc.easypanel.host${product.imageUrl}` 
        : '/placeholder.png');

  // Traduções internas
  const t = {
    choose: language === 'us' ? 'Choose an option' : (language === 'es' ? 'Elige una opción' : 'Escolha uma opção'),
    required: language === 'us' ? 'Required' : (language === 'es' ? 'Obligatorio' : 'Obrigatório'),
    completed: language === 'us' ? 'Completed' : (language === 'es' ? 'Completo' : 'Concluído'),
    optional: language === 'us' ? 'Optional' : (language === 'es' ? 'Opcional' : 'Opcional'),
    obs: language === 'us' ? 'Observations' : (language === 'es' ? 'Observaciones' : 'Observações'),
    obsPlace: language === 'us' ? 'Ex: No onions...' : (language === 'es' ? 'Ej: Sin cebolla...' : 'Ex: Sem cebola...'),
    add: language === 'us' ? 'ADD' : (language === 'es' ? 'AGREGAR' : 'ADICIONAR'),
    option: language === 'us' ? 'Option' : (language === 'es' ? 'Opción' : 'Opção'),
    total: 'Total'
  };

  // Handler de Seleção
  const handleModifierSelection = (group, modifier, type) => {
    setSelections(prev => {
      const currentSelected = prev[group.id] || [];
      
      if (type === 'single') {
        return { ...prev, [group.id]: [modifier] };
      } else {
        const isAlreadySelected = currentSelected.find(item => item.id === modifier.id);
        if (isAlreadySelected) {
          return { ...prev, [group.id]: currentSelected.filter(item => item.id !== modifier.id) };
        } else {
          if (group.maxSelection > 0 && currentSelected.length >= group.maxSelection) {
            return prev; 
          }
          return { ...prev, [group.id]: [...currentSelected, modifier] };
        }
      }
    });
  };

  // Validação
  const canAddToCart = () => {
    if (hasVariants && !selectedVariant) return false;

    for (const group of modifierGroups) {
      const selectedCount = (selections[group.id] || []).length;
      const min = parseInt(group.minSelection || 0);
      if (min > 0 && selectedCount < min) {
        return false;
      }
    }
    return true;
  };

  const handleAddToCart = () => {
    if (!canAddToCart()) return;

    const cartItem = {
      ...product,
      id: product.id,
      uniqueId: Date.now(),
      name: product.name,
      finalName: productName,
      finalImg: imageSrc,
      price: totalPrice / quantity,
      quantity,
      observation,
      productVariantId: selectedVariant ? selectedVariant.id : null,
      variantName: selectedVariant ? getTrans(selectedVariant.name, language) : null,
      modifiers: Object.values(selections).flat().map(m => ({
        id: m.id,
        name: m.name,
        price: m.price
      })),
      total: totalPrice
    };

    onConfirm(cartItem);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalPanel} onClick={e => e.stopPropagation()}>
        
        {/* ESQUERDA: Resumo Visual */}
        <div className={styles.leftPanel}>
          <div className={styles.imageContainer}>
            <Image 
              src={imageSrc} 
              alt={productName} 
              layout="fill"
              objectFit="cover"
              className={styles.animatedImage}
              unoptimized={true}
            />
          </div>
          <div className={styles.leftPanelContent}>
            <h3>{productName}</h3>
            <p>{productDesc}</p>
            
            <div className={styles.summary}>
                {/* Variante */}
                {selectedVariant && (
                    <div className={styles.summaryItem}>
                        <span className={styles.summaryNumber}>1</span>
                        <div className="flex-1">
                            <div className="flex justify-between">
                                <p className="font-bold text-sm">{t.option}</p>
                                <span className="text-xs font-semibold text-white">
                                    {formatCurrency(parseFloat(selectedVariant.price))}
                                </span>
                            </div>
                            <span className="text-xs text-gray-300">
                                {getTrans(selectedVariant.name, language)}
                            </span>
                        </div>
                    </div>
                )}

                {/* Modificadores Selecionados */}
                {modifierGroups.map((group, idx) => {
                    const selected = selections[group.id] || [];
                    if (selected.length === 0) return null;
                    return (
                    <div key={group.id} className={styles.summaryItem}>
                        <span className={styles.summaryNumber}>{hasVariants ? idx + 2 : idx + 1}</span>
                        <div className="flex-1">
                            <p className="font-bold text-sm">{getTrans(group.name, language)}</p>
                            <div className="flex flex-col">
                                {selected.map(s => (
                                    <div key={s.id} className="flex justify-between text-xs text-gray-300">
                                        <span>{getTrans(s.name, language)}</span>
                                        {parseFloat(s.price) > 0 && <span>+ {formatCurrency(parseFloat(s.price))}</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    );
                })}
            </div>

            <div className={styles.subtotal}>
              <span>{t.total}</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>
          </div>
        </div>

        {/* DIREITA: Opções */}
        <div className={styles.rightPanel}>
          <button className={styles.closeButton} onClick={onClose}><FaTimes size={18} /></button>
          
          <div className={styles.scrollableContent}>
            
            {/* --- VARIANTES --- */}
            {hasVariants && (
                <div className={styles.optionsContainer}>
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-gray-800">{t.choose}</h4>
                        <span className={`text-xs px-2 py-1 rounded font-bold ${selectedVariant ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {selectedVariant ? t.completed : t.required}
                        </span>
                    </div>
                    <div className={styles.choicesList}>
                        {variants.map(variant => {
                            const isSelected = selectedVariant?.id === variant.id;
                            return (
                                <label key={variant.id} className={`${styles.choiceLabel} ${isSelected ? styles.selected : ''}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-dynamic' : 'border-gray-300'}`}>
                                            {isSelected && <div className="w-2.5 h-2.5 bg-dynamic rounded-full" />}
                                        </div>
                                        <input 
                                            type="radio"
                                            name="variant_selection"
                                            className="hidden"
                                            checked={isSelected}
                                            onChange={() => setSelectedVariant(variant)}
                                        />
                                        <span className="text-gray-800 font-medium text-base">
                                            {getTrans(variant.name, language)}
                                        </span>
                                    </div>
                                    <span className="text-gray-600 font-bold">
                                        {formatCurrency(parseFloat(variant.price))}
                                    </span>
                                </label>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* --- MODIFICADORES --- */}
            {modifierGroups.map(group => {
              const isSingle = group.maxSelection === 1;
              const currentSelection = selections[group.id] || [];
              const min = parseInt(group.minSelection || 0);
              
              const isSatisfied = min > 0 ? currentSelection.length >= min : true;
              
              let badgeLabel = min > 0 
                ? (isSatisfied ? t.completed : `${t.required} (${min})`)
                : t.optional;
                
              let badgeClass = isSatisfied 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-orange-100 text-orange-700';
              
              if (min === 0) badgeClass = 'bg-gray-100 text-gray-500';

              return (
                <div key={group.id} className={styles.optionsContainer}>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-gray-800">{getTrans(group.name, language)}</h4>
                    <span className={`text-xs px-2 py-1 rounded font-bold ${badgeClass}`}>
                      {badgeLabel}
                    </span>
                  </div>
                  
                  <div className={styles.choicesList}>
                    {group.options?.map(choice => {
                      const isSelected = currentSelection.some(s => s.id === choice.id);
                      return (
                        <label key={choice.id} className={`${styles.choiceLabel} ${isSelected ? styles.selected : ''}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-dynamic' : 'border-gray-300'}`}>
                              {isSelected && <div className="w-2.5 h-2.5 bg-dynamic rounded-full" />}
                            </div>
                            <input 
                              type={isSingle ? 'radio' : 'checkbox'}
                              name={group.id}
                              className="hidden"
                              checked={isSelected}
                              onChange={() => handleModifierSelection(group, choice, isSingle ? 'single' : 'multiple')}
                            />
                            <span className="text-gray-700 font-medium">{getTrans(choice.name, language)}</span>
                          </div>
                          <span className="text-gray-500 font-semibold">
                            {parseFloat(choice.price) > 0 ? `+ ${formatCurrency(parseFloat(choice.price))}` : ''}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div className={styles.observation}>
              <label>{t.obs}</label>
              <input 
                type="text" 
                placeholder={t.obsPlace}
                value={observation} 
                onChange={(e) => setObservation(e.target.value)} 
              />
            </div>
          </div>

          <div className={styles.footerActions}>
            <div className={styles.quantityControl}>
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))}><FaMinus /></button>
              <span className={styles.quantityDisplay}>{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)}><FaPlus /></button>
            </div>

            <button 
              className={styles.submitButton} 
              onClick={handleAddToCart}
              disabled={!canAddToCart()}
              style={{ opacity: canAddToCart() ? 1 : 0.5 }}
            >
              {t.add} - {formatCurrency(totalPrice)}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}