'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { FaSpinner } from 'react-icons/fa';
import { io } from 'socket.io-client'; 
import api from '@/lib/api';
import { useRestaurant } from '@/context/RestaurantContext';

// Componentes
import Header from "@/components/Header/Header";
import Sidebar from "@/components/Sidebar/Sidebar";
import CategoryMenu from "@/components/CategoryMenu/CategoryMenu";
import SubCategoryMenu from "@/components/SubCategoryMenu/SubCategoryMenu";
import ProductList from "@/components/ProductList/ProductList";
import OffersList from "@/components/OffersList/OffersList"; 
import Cart from '@/components/Cart/Cart';
import AccountModal from '@/components/AccountModal/AccountModal';
import ReviewModal from '@/components/ReviewModal/ReviewModal';
import HighlightsCarousel from '@/components/HighlightsCarousel/HighlightsCarousel';
import ProductDetailModal from '@/components/ProductDetailModal/ProductDetailModal';
import ProductOptionsModal from '@/components/ProductOptionsModal/ProductOptionsModal';
import AboutModal from '@/components/AboutModal/AboutModal';
import BrandModal from '@/components/BrandModal/BrandModal';
import WaiterModal from '@/components/WaiterModal/WaiterModal';

import styles from './page.module.css';

// URL do Backend (Socket) - Ajuste se necessário para o seu domínio real
const SOCKET_URL = 'https://geral-ordengoapi.r954jc.easypanel.host';

export default function CardapioPage() {
  const router = useRouter();
  const { language } = useRestaurant(); 

  // --- ESTADOS DE DADOS ---
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState(null);
  const [menuTree, setMenuTree] = useState([]); 
  const [tableInfo, setTableInfo] = useState(null);
  const [tableSessionId, setTableSessionId] = useState(null);
  const [tableUUID, setTableUUID] = useState(null); 

  // --- ESTADOS DE NAVEGAÇÃO ---
  const [activeView, setActiveView] = useState('destaques');
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [activeSubCategoryId, setActiveSubCategoryId] = useState('all');

  // --- ESTADOS DE MODAIS ---
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isWaiterModalOpen, setIsWaiterModalOpen] = useState(false);
  
  // --- ESTADOS DE PRODUTO/CARRINHO ---
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productForOptions, setProductForOptions] = useState(null);
  const [cart, setCart] = useState([]);

  // ============================================================
  // 1. INICIALIZAÇÃO (FETCH DADOS)
  // ============================================================
  useEffect(() => {
    const init = async () => {
      const rId = Cookies.get('ordengo_restaurant_id');
      const tToken = Cookies.get('ordengo_table_token');
      const tInfoString = Cookies.get('ordengo_table_info');

      if (!rId || !tToken) {
        router.push('/setup');
        return;
      }

      setRestaurantId(rId);
      const tInfo = tInfoString ? JSON.parse(tInfoString) : null;
      setTableInfo(tInfo);

      try {
        // 1.1 Buscar Menu Completo
        const menuRes = await api.get(`/menu/public/${rId}`);
        const menuData = menuRes.data.data.menu;
        setMenuTree(menuData);
        
        // Seleciona a primeira categoria por padrão
        if (menuData.length > 0 && !activeCategoryId) {
          setActiveCategoryId(menuData[0].id);
          setActiveSubCategoryId('all');
        }

        // 1.2 Buscar Dados Atualizados da Mesa (UUID e Sessão)
        // Usamos a rota pública de acesso via token
        const accessRes = await api.get(`/tables/access/${tToken}`);
        const myTable = accessRes.data.data.table;
        
        if (myTable) {
            setTableUUID(myTable.uuid || myTable.id); // Garante o ID correto para o Socket
            if (myTable.currentSessionId) {
                setTableSessionId(myTable.currentSessionId);
            }
        }
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
        // Se o token for inválido (mesa deletada), manda pro setup
        if (error.response && error.response.status === 404) {
           Cookies.remove('ordengo_table_token');
           router.push('/setup');
        }
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router]);

  // ============================================================
  // 2. SOCKET.IO & MODO KIOSK (SEGURANÇA)
  // ============================================================
  useEffect(() => {
    if (!tableUUID || !restaurantId) return;

    const socket = io(SOCKET_URL, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log(`🔌 Tablet Online. Conectado à sala: table_${tableUUID}`);
      // Entra na sala exclusiva desta mesa para receber eventos direcionados
      socket.emit('join_room', { type: 'table', tableId: tableUUID });
    });

    // --- EVENTO: SESSÃO FECHADA (Limpeza Automática) ---
    socket.on('session_closed', (data) => {
      // Verifica se o evento é para esta mesa específica
      const targetTableId = data?.tableId;
      
      if (!targetTableId || targetTableId === tableUUID) {
        console.log("🔒 Conta fechada pelo caixa! Reiniciando...");
        
        const msg = language === 'us' ? 'Your bill has been paid. Thank you!' : 'Pagamento confirmado. A mesa será reiniciada.';
        alert(msg);
        
        // Limpa estados locais
        setCart([]);
        setTableSessionId(null);
        setIsAccountModalOpen(false);
        setIsWaiterModalOpen(false);
        setIsCartOpen(false);
        
        // Recarrega a página para garantir estado limpo ("Mesa Livre")
        window.location.reload();
      }
    });

    // --- EVENTO: FORÇAR DESCONEXÃO (Segurança) ---
    socket.on('force_disconnect', (data) => {
       if (!data?.tableId || data.tableId === tableUUID) {
          alert("Dispositivo desconectado pelo administrador.");
          
          // Limpa Cookies e volta pro Setup
          Cookies.remove('ordengo_table_token');
          Cookies.remove('ordengo_restaurant_id');
          Cookies.remove('ordengo_table_info');
          Cookies.remove('ordengo_lang');
          router.push('/setup');
       }
    });

    // --- KIOSK MODE: BLOQUEIO DO BOTÃO VOLTAR ---
    // Isso impede que o usuário use o botão "Voltar" do Android ou navegador
    window.history.pushState(null, null, window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, null, window.location.href);
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      socket.disconnect();
      window.removeEventListener('popstate', handlePopState);
    };
  }, [tableUUID, restaurantId, router, language]);

  // Bloqueio do Clique Direito (Context Menu)
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);


  // ============================================================
  // 3. LÓGICA DE NAVEGAÇÃO E PRODUTOS
  // ============================================================
  
  const handleCategorySelect = (categoryId) => {
    setActiveCategoryId(categoryId);
    setActiveSubCategoryId('all');
    setActiveView('menu');
  };

  // Filtragem eficiente dos produtos baseada na categoria/subcategoria ativa
  const { currentProducts, currentSubcategories, currentDisplayCategory } = useMemo(() => {
    if (!activeCategoryId) return { currentProducts: [], currentSubcategories: [], currentDisplayCategory: null };

    const category = menuTree.find(c => c.id === activeCategoryId);
    if (!category) return { currentProducts: [], currentSubcategories: [], currentDisplayCategory: null };

    const subcategories = category.subcategories || [];
    let products = [];
    let displayCategory = category; 

    if (activeSubCategoryId === 'all') {
      // Pega produtos da categoria pai
      if (category.Products && Array.isArray(category.Products)) {
        products = [...category.Products];
      }
      // Pega produtos de todas as subcategorias
      subcategories.forEach(sub => {
        if (sub.Products && Array.isArray(sub.Products)) {
          products = [...products, ...sub.Products];
        }
      });
    } else {
      // Pega produtos apenas da subcategoria selecionada
      const selectedSub = subcategories.find(s => s.id === activeSubCategoryId);
      if (selectedSub) {
          displayCategory = selectedSub; 
          if (selectedSub.Products && Array.isArray(selectedSub.Products)) {
            products = selectedSub.Products;
          }
      }
    }
    return { currentProducts: products, currentSubcategories: subcategories, currentDisplayCategory: displayCategory };
  }, [activeCategoryId, activeSubCategoryId, menuTree]);

  // Handlers de Carrinho e Modal de Produto
  const addToCart = (productItem) => {
    setCart(prev => [...prev, productItem]);
    setIsCartOpen(true);
    setProductForOptions(null);
  };
  const handleProductClick = (product) => setSelectedProduct(product);
  const handleOpenOptionsModal = (product) => setProductForOptions(product);
  const closeProductModal = () => setSelectedProduct(null);


  // ============================================================
  // 4. AÇÕES (API)
  // ============================================================

  const handleSubmitOrder = async (cartItemsToSubmit) => {
    if (!restaurantId) return;
    try {
        let sessionId = tableSessionId;
        
        // Se não tiver sessão, cria uma nova
        if (!sessionId) {
            const startRes = await api.post('/orders/session/start', {
                tableId: tableInfo.id, // Envia ID numérico (ou UUID), backend resolve
                restaurantId: restaurantId
            });
            sessionId = startRes.data.data.session.id;
            setTableSessionId(sessionId);
        }

        // Formata itens para o backend
        const itemsPayload = cartItemsToSubmit.map(item => ({
            productId: item.id,
            productVariantId: item.productVariantId || null,
            quantity: item.quantity,
            modifiers: item.modifiers || [],
            observation: item.observation || ''
        }));

        await api.post('/orders', {
            tableSessionId: sessionId,
            restaurantId: restaurantId,
            items: itemsPayload,
            notes: ''
        });
        
        const msg = language === 'us' ? 'Order sent successfully!' : 'Pedido enviado com sucesso!';
        alert(msg);
        
        setCart([]);
        setIsCartOpen(false);
    } catch (error) {
        console.error(error);
        const errMsg = language === 'us' ? 'Error sending order.' : 'Erro ao enviar pedido.';
        alert(errMsg);
    }
  };

   const handleRequestBill = async (paymentMethod) => {
    if (!tableInfo) return;
    try {
        await api.post('/notifications', {
            tableId: tableInfo.id,
            restaurantId: restaurantId,
            type: 'REQUEST_BILL',
            paymentMethod: paymentMethod 
        });
        
        // Feedback visual: Abre modal de espera ("Garçom a caminho") e fecha o da conta
        setIsWaiterModalOpen(true); 
        setIsAccountModalOpen(false); 
    } catch (error) {
        console.error(error);
        const msg = { br: 'Erro ao solicitar conta.', us: 'Error requesting bill.' };
        alert(msg[language] || msg.us);
    }
  };
  
  const handleCallWaiter = async () => {
     if (!tableInfo) return;
     try {
         await api.post('/notifications', {
             tableId: tableInfo.id,
             restaurantId: restaurantId,
             type: 'CALL_WAITER'
         });
         setIsWaiterModalOpen(true);
     } catch (error) {
         console.error(error);
         alert('Erro ao chamar garçom.');
     }
  };

  // ============================================================
  // 5. RENDERIZAÇÃO
  // ============================================================

  if (loading) {
    return (
        <div className="h-screen w-screen flex items-center justify-center bg-[#1f1c1d]">
            <FaSpinner className="animate-spin text-[#df0024] text-4xl" />
        </div>
    );
  }

  return (
    <div className={styles.container}>
      
      <Header 
        onCartClick={() => setIsCartOpen(true)} 
        onAccountClick={() => setIsAccountModalOpen(true)}
        onCallWaiter={handleCallWaiter} 
        tableNumber={tableInfo?.number}
      />
      
      <main className={styles.main}>
        <Sidebar 
          onReviewClick={() => setIsReviewModalOpen(true)}
          onAboutClick={() => setIsAboutModalOpen(true)}
          onBrandLogoClick={() => setIsBrandModalOpen(true)}
          activeCategory={activeView} 
          onCategoryClick={(view) => {
            setActiveView(view);
            // Ao voltar para o menu, seleciona a primeira categoria se nenhuma estiver ativa
            if (view === 'menu' && menuTree.length > 0 && !activeCategoryId) {
              setActiveCategoryId(menuTree[0].id);
              setActiveSubCategoryId('all');
            }
          }}
        />
        
        {activeView === 'destaques' ? (
          <HighlightsCarousel />
        ) : activeView === 'menu' ? (
          <>
            <CategoryMenu 
              categories={menuTree} 
              activeCategoryId={activeCategoryId}
              onCategorySelect={handleCategorySelect}
              language={language} 
            />
            
            <div className={styles.contentArea}>
              {currentSubcategories.length > 0 && (
                <SubCategoryMenu 
                  subcategories={currentSubcategories}
                  activeSubCategoryId={activeSubCategoryId}
                  onSelect={setActiveSubCategoryId}
                  language={language}
                />
              )}

              <ProductList 
                products={currentProducts}
                category={currentDisplayCategory} 
                language={language} 
                onProductClick={handleProductClick} 
                onAddToCartClick={handleOpenOptionsModal} 
              />
            </div>
          </>
        ) : activeView === 'ofertas' ? (
          <div className={styles.contentArea}>
             <OffersList />
          </div>
        ) : null}
      </main>

      {/* MODAIS DE INTERAÇÃO */}
      
      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cartItems={cart} 
        setCartItems={setCart} 
        language={language} 
        onSubmitOrder={handleSubmitOrder} 
      />
      
      <AccountModal 
        isOpen={isAccountModalOpen} 
        onClose={() => setIsAccountModalOpen(false)} 
        tableSessionId={tableSessionId} 
        language={language} 
        onRequestBill={handleRequestBill} 
      />
      
      <ReviewModal 
        isOpen={isReviewModalOpen} 
        onClose={() => setIsReviewModalOpen(false)} 
      />
      
      <AboutModal 
        isOpen={isAboutModalOpen} 
        onClose={() => setIsAboutModalOpen(false)} 
      />
      
      <BrandModal 
        isOpen={isBrandModalOpen} 
        onClose={() => setIsBrandModalOpen(false)} 
      />
      
      <WaiterModal 
        isOpen={isWaiterModalOpen} 
        onClose={() => setIsWaiterModalOpen(false)} 
        language={language} 
      />

      {/* Modais de Produto */}
      <ProductDetailModal 
        isOpen={!!selectedProduct} 
        onClose={closeProductModal}
        product={selectedProduct}
        language={language}
        onAddToCart={handleOpenOptionsModal} 
      />
     
      <ProductOptionsModal 
        isOpen={!!productForOptions} 
        onClose={() => setProductForOptions(null)} 
        product={productForOptions} 
        language={language} 
        onConfirm={addToCart} 
      />
    </div>
  );
}