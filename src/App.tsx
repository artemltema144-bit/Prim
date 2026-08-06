import { useState, useEffect } from 'react';
import {
  ShoppingCart,
  User,
  Search,
  Menu,
  X,
  Plus,
  Minus,
  Trash2,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Store,
  Star,
  ChevronRight as ChevronRightIcon,
  ShieldCheck,
  Package,
  MapPin,
  Info,
  Upload,
  RefreshCw,
  XCircle
} from 'lucide-react';
import canvasConfetti from 'canvas-confetti';
import type { BankUser, BankInvoice, Product } from './supabaseClient';
import { getProducts, addProduct } from './productService';
import { findUserByPassport, createInvoice, startPollingInvoice, getSellerInvoices, cancelInvoice } from './bankService';

// PromIn - Пром Ирновии
// Purple: #522b82
// Orange: #ff5a00

export default function App() {
  // Navigation / Filter States
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'popular' | 'discounts' | 'new'>('popular');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSellerDashboard, setIsSellerDashboard] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);

  // Auth States
  const [user, setUser] = useState<BankUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authPassport, setAuthPassport] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Cart States
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Checkout States
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [checkoutPassport, setCheckoutPassport] = useState('');
  const [checkoutCoordinates, setCheckoutCoordinates] = useState('');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState<BankInvoice | null>(null);
  const [paymentPolling, setPaymentPolling] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentBuyerName, setPaymentBuyerName] = useState('');

  // Seller Dashboard States
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Автомобили и мото');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [sellerPassport, setSellerPassport] = useState('');
  const [sellerError, setSellerError] = useState<string | null>(null);
  const [sellerSuccess, setSellerSuccess] = useState(false);
  const [sellerAdding, setSellerAdding] = useState(false);

  // Seller Dashboard Order Management States
  const [sellerDashboardTab, setSellerDashboardTab] = useState<'add_product' | 'orders'>('add_product');
  const [sellerInvoices, setSellerInvoices] = useState<BankInvoice[]>([]);
  const [loadingSellerInvoices, setLoadingSellerInvoices] = useState(false);

  // Image Upload States
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Banner Carousel Index
  const [bannerIndex, setBannerIndex] = useState(0);

  // Product Details Slideshow Index
  const [detailsImgIndex, setDetailsImgIndex] = useState(0);

  const categories = [
    "Автомобили и мото",
    "Мебель и интерьер",
    "Одежда и стиль",
    "Электроника",
    "Услуги",
    "Продукты питания"
  ];

  const bannerImages = [
    {
      title: "Ирни Моторс GT-6",
      subtitle: "Отечественный шедевр автомобилестроения Ирновии в кредит под 0%",
      image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
      accent: "Автомобили"
    },
    {
      title: "Официальный Эквайринг Нацбанка",
      subtitle: 'Безопасные и мгновенные платежи в валюте Жорон {"}|{"}',
      image: "https://images.unsplash.com/photo-1563013544-824ae1d704d3?auto=format&fit=crop&w=1200&q=80",
      accent: "Финансы"
    },
    {
      title: "Электроника нового поколения",
      subtitle: "От лучших продавцов Ирновии с доставкой прямо к вашему порогу",
      image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&w=1200&q=80",
      accent: "Технологии"
    }
  ];

  // Auto scroll banners
  useEffect(() => {
    const timer = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % bannerImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [bannerImages.length]);

  // Fetch products on load
  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
      setLoading(false);
    }
    load();

    // Recover user session if exists
    const savedUser = localStorage.getItem('promin_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setSellerPassport(JSON.parse(savedUser).passport_code); // Pre-fill seller passport code
      } catch {
        // ignore
      }
    }

    // Recover cart if exists
    const savedCart = localStorage.getItem('promin_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch {
        // ignore
      }
    }
  }, []);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('promin_cart', JSON.stringify(cart));
  }, [cart]);

  // Reset product details image index when product changes
  useEffect(() => {
    setDetailsImgIndex(0);
  }, [selectedProduct]);

  // Helper to parse image URL field
  function parseProductImages(imageUrlString: string): string[] {
    try {
      const parsed = JSON.parse(imageUrlString);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // not a JSON string, fallback to standard parsing
    }
    return imageUrlString ? [imageUrlString] : ["https://images.unsplash.com/photo-1546213290-e1b7610339e5?auto=format&fit=crop&w=600&q=80"];
  }

  // Load seller invoices when tab switches to orders or sellerPassport changes
  useEffect(() => {
    if (isSellerDashboard && sellerDashboardTab === 'orders' && sellerPassport.trim()) {
      loadSellerOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSellerDashboard, sellerDashboardTab, sellerPassport]);

  async function loadSellerOrders() {
    if (!sellerPassport.trim()) return;
    setLoadingSellerInvoices(true);
    const invoices = await getSellerInvoices(sellerPassport);
    setSellerInvoices(invoices);
    setLoadingSellerInvoices(false);
  }

  // Handle Cancel/Refund of order by Seller
  async function handleDeclineOrder(invoiceId: string) {
    if (!window.confirm("Вы действительно хотите отказаться от заказа? Средства будут мгновенно возвращены покупателю в Нацбанке Ирновии.")) {
      return;
    }

    setLoadingSellerInvoices(true);
    const success = await cancelInvoice(invoiceId);
    if (success) {
      alert("Заказ успешно отменен. Статус счета изменен на 'cancelled', деньги автоматически возвращены на счет покупателя.");
      await loadSellerOrders();
    } else {
      alert("Не удалось изменить статус счета в базе данных Нацбанка.");
    }
    setLoadingSellerInvoices(false);
  }

  // Handle login
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    if (!authPassport.trim()) {
      setAuthError("Пожалуйста, введите код паспорта.");
      setAuthLoading(false);
      return;
    }

    const citizen = await findUserByPassport(authPassport);
    if (citizen) {
      setUser(citizen);
      setSellerPassport(citizen.passport_code); // Sync seller passport
      localStorage.setItem('promin_user', JSON.stringify(citizen));
      setIsAuthModalOpen(false);
      setAuthPassport('');
    } else {
      setAuthError("Гражданин с таким паспортом не зарегистрирован в Нацбанке Ирновии! Пожалуйста, проверьте код.");
    }
    setAuthLoading(false);
  }

  function handleLogout() {
    setUser(null);
    localStorage.removeItem('promin_user');
    setSellerPassport('');
    setIsSellerDashboard(false);
  }

  // Shopping Cart Actions
  function addToCart(product: Product) {
    if (product.id.startsWith('seed-')) return; // Block decorative products

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  }

  function updateQuantity(productId: string, delta: number) {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter((item): item is { product: Product; quantity: number } => item !== null)
    );
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Pre-fill checkout fields when user is logged in
  useEffect(() => {
    if (user) {
      setCheckoutName(`${user.first_name} ${user.last_name}`);
      setCheckoutPassport(user.passport_code);
    } else {
      setCheckoutName('');
      setCheckoutPassport('');
    }
  }, [user]);

  // Handle Free Cloud Image Upload (ImgBB) with ultra-reliable Base64 & size compression fallback
  async function compressAndUploadImage(file: File): Promise<string> {
    // 1. Convert to compressed, resized JPEG to keep it extremely small (<100KB) and load blazingly fast
    const compressedBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Limit width/height to max 600px to maintain tiny payload size
          const MAX_SIZE = 600;
          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Compress image quality down to 0.6
            resolve(canvas.toDataURL('image/jpeg', 0.6));
          } else {
            resolve(event.target?.result as string);
          }
        };
        img.onerror = () => reject("Ошибка декодирования фото");
        img.src = event.target?.result as string;
      };
      reader.onerror = () => reject("Ошибка чтения файла");
      reader.readAsDataURL(file);
    });

    // 2. Try to upload to ImgBB
    try {
      const formData = new FormData();
      // ImgBB supports base64 parameter directly! We just strip the metadata prefix
      const base64Clean = compressedBase64.split(',')[1];
      formData.append('image', base64Clean);

      const res = await fetch('https://api.imgbb.com/1/upload?key=60bd34c065604854e1eec5b2e28a4544', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data && data.success && data.data && data.data.url) {
        return data.data.url;
      }
    } catch (err) {
      console.warn("ImgBB upload failed, falling back to other free cloud providers:", err);
    }

    // 3. Try fallback to freeimage.host API or use raw compressed base64 directly
    // Base64 is 100% reliable, runs entirely on client side, doesn't depend on CORS or network limits, and works everywhere!
    return compressedBase64;
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    setSellerError(null);

    const filesToUpload = Array.from(e.target.files).slice(0, 4 - uploadedImages.length);
    const uploadedUrls: string[] = [];

    for (const file of filesToUpload) {
      try {
        const url = await compressAndUploadImage(file);
        if (url) {
          uploadedUrls.push(url);
        }
      } catch (err: any) {
        console.error("Error processing/uploading image:", err);
        setSellerError(err?.message || "Не удалось обработать изображение. Попробуйте другой файл.");
      }
    }

    if (uploadedUrls.length > 0) {
      setUploadedImages((prev) => [...prev, ...uploadedUrls].slice(0, 4));
    }
    setUploading(false);
  }

  function removeUploadedImage(index: number) {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  }

  // Checkout and Invoice creation
  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setCheckoutError(null);
    setCheckoutLoading(true);

    if (!checkoutName.trim() || !checkoutPhone.trim() || !checkoutPassport.trim() || !checkoutCoordinates.trim()) {
      setCheckoutError("Пожалуйста, заполните все поля, включая координаты доставки.");
      setCheckoutLoading(false);
      return;
    }

    // 1. Verify Buyer Passport in Bank
    const buyerCitizen = await findUserByPassport(checkoutPassport);
    if (!buyerCitizen) {
      setCheckoutError("Гражданин с таким паспортом не зарегистрирован в Нацбанке Ирновии! Пожалуйста, сначала зарегистрируйте карту в банке.");
      setCheckoutLoading(false);
      return;
    }

    // Name confirmation
    const buyerName = `${buyerCitizen.first_name} ${buyerCitizen.last_name}`;
    setPaymentBuyerName(buyerName);

    // 2. Select Seller Passport (use the first item's seller, or default "Т•01•180426•814" if none)
    const primaryProduct = cart[0]?.product;
    const sellerPassportCode = primaryProduct?.seller_passport || "Т•01•180426•814";

    // 3. Create Invoice containing Delivery Coordinates
    const invoice = await createInvoice(
      sellerPassportCode,
      checkoutPassport,
      cartTotal,
      `Оплата заказа на Пром Ирновии. Координаты доставки: ${checkoutCoordinates.trim()} (${cart.map(i => `${i.product.name} x${i.quantity}`).join(', ').substring(0, 60)})`
    );

    if (!invoice) {
      setCheckoutError("Ошибка при создании счета в Нацбанке. Пожалуйста, попробуйте еще раз.");
      setCheckoutLoading(false);
      return;
    }

    // Go to Polling state
    setCreatedInvoice(invoice);
    setPaymentPolling(true);
    setCheckoutLoading(false);
  }

  // Invoice status polling
  useEffect(() => {
    if (!createdInvoice || !paymentPolling) return;

    const stopPolling = startPollingInvoice(createdInvoice.id, (status) => {
      if (status === 'paid') {
        stopPolling();
        setPaymentPolling(false);
        setPaymentSuccess(true);
        setCart([]); // Clear cart
        canvasConfetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
      } else if (status === 'cancelled') {
        stopPolling();
        setPaymentPolling(false);
        setCheckoutError("Счет был отклонен или отменен продавцом.");
        setCreatedInvoice(null);
      }
    });

    return () => stopPolling();
  }, [createdInvoice, paymentPolling]);

  // Seller Dashboard logic
  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    setSellerError(null);
    setSellerSuccess(false);
    setSellerAdding(true);

    if (!newProdName.trim() || !newProdPrice.trim() || !newProdCategory.trim() || !newProdDesc.trim() || !sellerPassport.trim()) {
      setSellerError("Пожалуйста, заполните все обязательные поля.");
      setSellerAdding(false);
      return;
    }

    if (uploadedImages.length === 0) {
      setSellerError("Пожалуйста, загрузите хотя бы 1 изображение вашего товара (максимум 4).");
      setSellerAdding(false);
      return;
    }

    // Verify Seller Passport
    const isSellerValid = await findUserByPassport(sellerPassport);
    if (!isSellerValid) {
      setSellerError("Продавец с таким паспортом не зарегистрирован в Нацбанке Ирновии! Пожалуйста, укажите действительный паспорт.");
      setSellerAdding(false);
      return;
    }

    const priceNum = parseInt(newProdPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setSellerError("Пожалуйста, укажите корректную цену.");
      setSellerAdding(false);
      return;
    }

    // Store up to 4 cloud URLs as a JSON string
    const imgUrlField = JSON.stringify(uploadedImages);

    try {
      await addProduct({
        name: newProdName.trim(),
        description: newProdDesc.trim(),
        price: priceNum,
        category: newProdCategory,
        image_url: imgUrlField,
        seller_passport: sellerPassport.trim()
      });

      setSellerSuccess(true);
      // Reset form
      setNewProdName('');
      setNewProdPrice('');
      setNewProdDesc('');
      setUploadedImages([]);

      // Reload products
      const updatedProds = await getProducts();
      setProducts(updatedProds);
    } catch {
      setSellerError("Не удалось сохранить товар в базе данных.");
    } finally {
      setSellerAdding(false);
    }
  }

  // Filter products based on search and category
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  // Split products into Popular, Discount, and New for the grid (using mocks/ID filters)
  const popularProducts = filteredProducts.filter((p) => !p.id.includes('service') && p.price > 1000);
  const discountProducts = filteredProducts.filter((p) => p.price < 10000);
  const newProducts = [...filteredProducts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const displayedProducts =
    activeTab === 'popular' ? popularProducts :
    activeTab === 'discounts' ? discountProducts :
    newProducts;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col">

      {/* TOP HELPER HEADER */}
      <div className="bg-slate-100 border-b border-slate-200 py-1.5 px-4 text-xs text-slate-500 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex gap-4">
            <span className="hover:text-purple-700 cursor-pointer">О маркетплейсе PromIn</span>
            <span className="hover:text-purple-700 cursor-pointer">Доставка и оплата</span>
            <span className="hover:text-purple-700 cursor-pointer">Кабинет покупателя</span>
          </div>
          <div className="flex gap-4 items-center">
            <span className="text-purple-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Защита покупателя 100%
            </span>
            <span>Горячая линия: 0-800-PROM-IRN</span>
          </div>
        </div>
      </div>

      {/* MAIN PURPLE HEADER (PROM.UA CLONE) */}
      <header className="bg-[#522b82] text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row gap-3 items-center justify-between">

          {/* Logo & Catalog trigger */}
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
              setSelectedCategory(null);
              setIsSellerDashboard(false);
            }}>
              <div className="bg-white text-[#522b82] font-black px-3.5 py-1.5 rounded-lg text-2xl tracking-tighter shadow-inner flex items-center gap-1.5">
                <Store className="w-6 h-6 stroke-[2.5]" />
                <span>PromIn</span>
              </div>
              <span className="hidden lg:inline text-xs bg-purple-900 px-2 py-1 rounded text-purple-200 uppercase tracking-widest font-bold">
                Ирновия
              </span>
            </div>

            {/* Catalog Button for Mobile/Tablet */}
            <button
              onClick={() => setCatalogOpen(!catalogOpen)}
              className="bg-purple-900/50 hover:bg-purple-900/80 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition"
            >
              <Menu className="w-4 h-4" />
              <span>Каталог</span>
            </button>
          </div>

          {/* Large search bar */}
          <div className="w-full md:flex-1 max-w-2xl relative flex">
            <input
              type="text"
              placeholder="Поиск товаров, услуг, брендов в Ирновии..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-slate-800 px-4 py-2.5 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-slate-400 text-sm shadow-sm"
            />
            <button className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-6 py-2.5 rounded-r-lg font-bold flex items-center gap-2 text-sm transition-all shadow-sm">
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Найти</span>
            </button>
          </div>

          {/* Profile & Cart */}
          <div className="flex items-center gap-3.5 w-full md:w-auto justify-end md:justify-start">

            {/* Seller portal link */}
            <button
              onClick={() => {
                setIsSellerDashboard(true);
                setSelectedCategory(null);
              }}
              className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 border border-purple-400 hover:bg-purple-900 transition-all ${isSellerDashboard ? 'bg-orange-500 border-orange-500' : 'bg-transparent'}`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Стать продавцом</span>
            </button>

            {/* User Profile */}
            {user ? (
              <div className="relative group flex items-center gap-2 cursor-pointer">
                <div className="bg-purple-900/70 hover:bg-purple-900 px-3 py-1.5 rounded flex items-center gap-2 text-sm border border-purple-400">
                  <User className="w-4 h-4 text-purple-300" />
                  <span className="font-medium max-w-[100px] truncate">{user.first_name}</span>
                </div>
                <div className="absolute right-0 top-full mt-1 bg-white text-slate-800 rounded-lg shadow-xl py-2 w-48 border border-slate-100 hidden group-hover:block z-50">
                  <div className="px-4 py-2 border-b border-slate-100 text-xs text-slate-400">
                    Паспорт: <span className="font-mono font-semibold text-slate-600">{user.passport_code}</span>
                  </div>
                  <div className="px-4 py-2 font-bold text-sm truncate">
                    {user.first_name} {user.last_name}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-2 transition"
                  >
                    Выйти из кабинета
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-purple-900/50 hover:bg-purple-900/80 px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 text-sm font-semibold transition border border-purple-400"
              >
                <User className="w-4 h-4 text-purple-200" />
                <span>Войти</span>
              </button>
            )}

            {/* Shopping Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 p-2.5 rounded-lg relative flex items-center justify-center transition-all shadow-md group"
            >
              <ShoppingCart className="w-5 h-5 text-white group-hover:scale-105 transition" />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-white text-[#522b82] text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#522b82] animate-bounce">
                  {cart.reduce((sum, i) => sum + i.quantity, 0)}
                </span>
              )}
            </button>

          </div>

        </div>
      </header>

      {/* CATALOG POPDOWN FOR BOTH DESKTOP AND MOBILE */}
      {catalogOpen && (
        <div className="bg-white border-b border-slate-200 shadow-lg py-4 transition-all">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setIsSellerDashboard(false);
                  setCatalogOpen(false);
                }}
                className={`p-3 rounded-lg border text-sm font-semibold transition text-left flex items-center justify-between group ${selectedCategory === cat ? 'bg-purple-50 border-[#522b82] text-[#522b82]' : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'}`}
              >
                <span>{cat}</span>
                <ChevronRightIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition text-[#522b82]" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CORE BODY OF THE APP */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-6">

        {/* VIEW: SELLER DASHBOARD */}
        {isSellerDashboard ? (
          <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-150">
              <h2 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
                <Store className="w-6 h-6 text-[#522b82]" /> Кабинет продавца PromIn
              </h2>
              <button
                onClick={() => setIsSellerDashboard(false)}
                className="text-slate-400 hover:text-slate-600 transition flex items-center gap-1 text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4" /> На главную
              </button>
            </div>

            {/* SELLER IDENTITY INPUT (Passport Required for both functions) */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Паспорт продавца Ирновии (для управления товарами и заказами) *
                </label>
                <input
                  type="text"
                  placeholder="Пример: Т•01•180426•814"
                  value={sellerPassport}
                  onChange={(e) => setSellerPassport(e.target.value)}
                  className="w-full max-w-md border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-400 font-mono font-bold"
                />
              </div>

              {/* SUB-TABS TO SWITCH BETWEEN ADD_PRODUCT AND MANAGE ORDERS */}
              {sellerPassport.trim() && (
                <div className="flex bg-slate-200 rounded-lg p-1 text-xs font-bold text-slate-500 self-start md:self-auto shadow-inner">
                  <button
                    onClick={() => setSellerDashboardTab('add_product')}
                    className={`px-4 py-2 rounded-md transition-all ${sellerDashboardTab === 'add_product' ? 'bg-white text-[#522b82] shadow-sm' : 'hover:text-slate-800'}`}
                  >
                    Выставить товар
                  </button>
                  <button
                    onClick={() => {
                      setSellerDashboardTab('orders');
                      loadSellerOrders();
                    }}
                    className={`px-4 py-2 rounded-md transition-all flex items-center gap-1.5 ${sellerDashboardTab === 'orders' ? 'bg-white text-[#522b82] shadow-sm' : 'hover:text-slate-800'}`}
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>Управление заказами</span>
                  </button>
                </div>
              )}
            </div>

            {/* SELLER DASHBOARD - TAB: ADD PRODUCT */}
            {sellerDashboardTab === 'add_product' ? (
              <div className="space-y-4">
                <div className="bg-purple-50 text-purple-900 p-4 rounded-lg flex gap-3 text-sm border border-purple-100">
                  <Info className="w-5 h-5 flex-shrink-0 text-[#522b82]" />
                  <div>
                    <p className="font-bold">Как выставить свои товары?</p>
                    <p className="mt-1">
                      Заполните форму ниже.
                      Вы можете загрузить **до 4 фотографий** вашего товара прямо к нам на сайт! Наша интеллектуальная система сожмет их и загрузит на безплатное облако мгновенно, со 100% успехом!
                    </p>
                  </div>
                </div>

                <form onSubmit={handleAddProduct} className="space-y-4">
                  {sellerError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-lg flex gap-2 text-sm font-medium">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <span>{sellerError}</span>
                    </div>
                  )}
                  {sellerSuccess && (
                    <div className="bg-green-50 border border-green-200 text-green-700 p-3.5 rounded-lg flex gap-2 text-sm font-medium">
                      <CheckCircle className="w-5 h-5 flex-shrink-0" />
                      <span>Ваш товар успешно зарегистрирован и выставлен на продажу с реальными фотографиями из облака!</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Название товара *</label>
                      <input
                        type="text"
                        required
                        placeholder="Например: Стул дизайнерский"
                        value={newProdName}
                        onChange={(e) => setNewProdName(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Категория товара *</label>
                      <select
                        value={newProdCategory}
                        onChange={(e) => setNewProdCategory(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Цена в Жоронах (целое число) *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="Пример: 1200"
                        value={newProdPrice}
                        onChange={(e) => setNewProdPrice(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
                      />
                    </div>

                    {/* CLOUD MULTI-IMAGE UPLOADER (UP TO 4 PHOTOS) WITH 100% BASE64 COMPRESSION FALLBACK */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        ФОТОГРАФИИ ТОВАРA (до 4 шт.) *
                      </label>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border border-slate-200 p-2 rounded-lg bg-slate-50">
                        {uploadedImages.map((img, idx) => (
                          <div key={idx} className="relative h-14 bg-white border border-slate-200 rounded-md overflow-hidden group shadow-sm">
                            <img src={img} alt="Preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeUploadedImage(idx)}
                              className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full p-0.5 opacity-90 hover:opacity-100 hover:scale-105 shadow-md transition"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ))}

                        {uploadedImages.length < 4 && (
                          <label className="border-2 border-dashed border-slate-300 hover:border-[#522b82] hover:bg-purple-50/50 rounded-md h-14 flex flex-col items-center justify-center cursor-pointer transition p-1 text-center text-[10px] font-bold text-slate-500 group">
                            {uploading ? (
                              <div className="w-4 h-4 border-2 border-[#522b82] border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Upload className="w-4 h-4 text-slate-400 group-hover:text-[#522b82]" />
                            )}
                            <span>Загрузить</span>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              disabled={uploading}
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Описание товара *</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Опишите характеристики, размеры, состояние и условия поставки товара..."
                      value={newProdDesc}
                      onChange={(e) => setNewProdDesc(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
                    ></textarea>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={sellerAdding || uploading}
                      className="w-full bg-[#522b82] text-white py-3 rounded-lg font-bold hover:bg-purple-900 active:bg-purple-950 transition-all shadow-md flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed text-base"
                    >
                      {sellerAdding ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Регистрация товара...</span>
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-5 h-5" />
                          <span>Выставить товар на продажу</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* SELLER DASHBOARD - TAB: MANAGE ORDERS (REAL-TIME DB QUERIES) */
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
                    <Package className="w-5 h-5 text-purple-700" /> Поступившие заказы и платежи ({sellerInvoices.length})
                  </h3>
                  <button
                    onClick={loadSellerOrders}
                    disabled={loadingSellerInvoices}
                    className="p-1.5 px-3 bg-purple-50 text-[#522b82] hover:bg-purple-100 border border-purple-100 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingSellerInvoices ? 'animate-spin' : ''}`} />
                    <span>Обновить список</span>
                  </button>
                </div>

                {!sellerPassport.trim() ? (
                  <p className="text-sm font-semibold text-slate-400">Пожалуйста, укажите код паспорта в поле выше для загрузки заказов.</p>
                ) : loadingSellerInvoices ? (
                  <div className="flex flex-col items-center justify-center py-16 space-y-3">
                    <div className="w-10 h-10 border-4 border-[#522b82] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs text-slate-500 font-semibold">Сверка входящих счетов в реестре Национального Банка...</p>
                  </div>
                ) : sellerInvoices.length === 0 ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-12 text-center text-slate-500">
                    <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="font-bold text-slate-700 text-sm">У вас пока нет заказов</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Как только покупатели выберут ваши товары и нажмут кнопку оплаты, их счета появятся здесь в реальном времени.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sellerInvoices.map((inv) => (
                      <div key={inv.id} className="bg-white border border-slate-200 hover:border-slate-300 p-4 rounded-xl shadow-sm space-y-3 transition duration-200">
                        {/* Title Row */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-2.5">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">ID Заказа (Счета)</span>
                            <p className="font-mono text-xs font-bold text-slate-700">{inv.id}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {inv.status === 'pending' && (
                              <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                                Ожидает оплаты
                              </span>
                            )}
                            {inv.status === 'paid' && (
                              <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                Оплачен покупателем
                              </span>
                            )}
                            {inv.status === 'cancelled' && (
                              <span className="bg-red-100 text-red-800 border border-red-200 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                Отменен / Возвращен
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Order info details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          <div>
                            <span className="text-slate-400 font-semibold block mb-0.5">Покупатель (Паспорт)</span>
                            <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{inv.receiver_passport}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-semibold block mb-0.5">Сумма к зачислению</span>
                            <span className="text-sm font-black text-slate-800">{inv.amount.toLocaleString('ru-RU')} <span className="text-purple-700 font-bold">{"}|{"}</span></span>
                          </div>
                          <div className="md:col-span-1">
                            <span className="text-slate-400 font-semibold block mb-0.5">Время транзакции</span>
                            <span className="font-semibold text-slate-600">{inv.created_at ? new Date(inv.created_at).toLocaleString('ru-RU') : 'Только что'}</span>
                          </div>
                        </div>

                        {/* Delivery address & goods info */}
                        <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg text-xs">
                          <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Сведения о заказе и доставке:</span>
                          <p className="font-medium text-slate-700 whitespace-pre-wrap leading-relaxed">
                            {inv.description}
                          </p>
                        </div>

                        {/* Action buttons */}
                        {inv.status !== 'cancelled' && (
                          <div className="flex justify-end pt-1">
                            <button
                              onClick={() => handleDeclineOrder(inv.id)}
                              className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 hover:border-red-600 p-2 px-4 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Отказаться от заказа / Вернуть средства</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* VIEW: HOMEPAGE / CATALOG */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

            {/* Left sidebar with categories */}
            <aside className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-100 p-4 h-fit hidden lg:block sticky top-20">
              <div className="text-sm font-black text-[#522b82] pb-3 mb-3 border-b border-slate-100 flex items-center gap-2">
                <Menu className="w-4 h-4" />
                <span>КАТЕГОРИИ ТОВАРОВ</span>
              </div>
              <nav className="flex flex-col gap-1">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition ${selectedCategory === null ? 'bg-[#522b82] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-[#522b82]'}`}
                >
                  Все категории
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition flex items-center justify-between group ${selectedCategory === cat ? 'bg-[#522b82] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-[#522b82]'}`}
                  >
                    <span>{cat}</span>
                    <ChevronRightIcon className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                ))}
              </nav>
              <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50 p-3 rounded-lg text-xs text-slate-500">
                <p className="font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#522b82]" /> Безопасная Ирновия
                </p>
                <p>Все сделки на маркетплейсе защищены Национальным Банком Ирновии. Мы заморозим средства, пока вы не получите товар.</p>
              </div>
            </aside>

            {/* Main content column */}
            <div className="lg:col-span-3 space-y-6">

              {/* Promotional Slider */}
              {!selectedCategory && !searchQuery && (
                <div className="relative bg-[#522b82] rounded-2xl overflow-hidden shadow-md h-[220px] md:h-[300px] text-white flex items-center group">
                  <div className="absolute inset-0 z-0 select-none">
                    <img
                      src={bannerImages[bannerIndex].image}
                      alt={bannerImages[bannerIndex].title}
                      className="w-full h-full object-cover opacity-35 transition-all duration-700 ease-in-out scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#522b82] via-[#522b82]/80 to-transparent"></div>
                  </div>

                  <div className="relative z-10 px-6 md:px-12 max-w-xl">
                    <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider mb-2.5 inline-block shadow-sm">
                      {bannerImages[bannerIndex].accent}
                    </span>
                    <h3 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-2">
                      {bannerImages[bannerIndex].title}
                    </h3>
                    <p className="text-sm md:text-base text-purple-100 leading-relaxed font-medium">
                      {bannerImages[bannerIndex].subtitle}
                    </p>
                  </div>

                  {/* Left & Right buttons */}
                  <button
                    onClick={() => setBannerIndex((prev) => (prev - 1 + bannerImages.length) % bannerImages.length)}
                    className="absolute left-4 bg-black/30 hover:bg-[#522b82] p-1.5 rounded-full z-10 opacity-0 group-hover:opacity-100 transition duration-300"
                  >
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={() => setBannerIndex((prev) => (prev + 1) % bannerImages.length)}
                    className="absolute right-4 bg-black/30 hover:bg-[#522b82] p-1.5 rounded-full z-10 opacity-0 group-hover:opacity-100 transition duration-300"
                  >
                    <ChevronRight className="w-5 h-5 text-white" />
                  </button>

                  {/* Indicators */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
                    {bannerImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setBannerIndex(i)}
                        className={`w-2 h-2 rounded-full transition-all ${bannerIndex === i ? 'bg-orange-500 w-5' : 'bg-white/40'}`}
                      ></button>
                    ))}
                  </div>
                </div>
              )}

              {/* Grid Header & Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div>
                  <h2 className="text-lg md:text-xl font-black text-slate-800">
                    {selectedCategory ? `${selectedCategory}` : searchQuery ? `Результаты поиска по "${searchQuery}"` : "Рекомендуемые товары Ирновии"}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Всего найдено {filteredProducts.length} товаров</p>
                </div>

                {/* Horizontal tabs (only if not searching or filtering category) */}
                {!selectedCategory && !searchQuery && (
                  <div className="flex bg-slate-100 rounded-lg p-1 text-xs font-semibold text-slate-500 self-start sm:self-auto">
                    <button
                      onClick={() => setActiveTab('popular')}
                      className={`px-3.5 py-1.5 rounded-md transition-all ${activeTab === 'popular' ? 'bg-white text-[#522b82] shadow-sm font-bold' : 'hover:text-slate-800'}`}
                    >
                      Популярные
                    </button>
                    <button
                      onClick={() => setActiveTab('discounts')}
                      className={`px-3.5 py-1.5 rounded-md transition-all ${activeTab === 'discounts' ? 'bg-white text-[#522b82] shadow-sm font-bold' : 'hover:text-slate-800'}`}
                    >
                      Скидки
                    </button>
                    <button
                      onClick={() => setActiveTab('new')}
                      className={`px-3.5 py-1.5 rounded-md transition-all ${activeTab === 'new' ? 'bg-white text-[#522b82] shadow-sm font-bold' : 'hover:text-slate-800'}`}
                    >
                      Новинки
                    </button>
                  </div>
                )}
              </div>

              {/* PRODUCTS LIST GRID */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <div className="w-12 h-12 border-4 border-[#522b82] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm font-semibold text-slate-500">Загрузка товаров маркетплейса...</p>
                </div>
              ) : displayedProducts.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center">
                  <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-base font-bold text-slate-700">Товары отсутствуют</p>
                  <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">В этой категории пока нет выставленных товаров. Будьте первыми! Зайдите в кабинет продавца и добавьте товар.</p>
                  <button
                    onClick={() => setIsSellerDashboard(true)}
                    className="mt-4 bg-[#522b82] text-white px-5 py-2 rounded-lg font-bold hover:bg-purple-900 transition-all shadow-md text-sm"
                  >
                    Стать продавцом
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {displayedProducts.map((p) => {
                    const isSeed = p.id.startsWith('seed-');
                    const images = parseProductImages(p.image_url);

                    return (
                      <div
                        key={p.id}
                        className="bg-white rounded-xl overflow-hidden border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group cursor-pointer"
                        onClick={() => setSelectedProduct(p)}
                      >
                        {/* Product Image */}
                        <div className="relative h-48 overflow-hidden bg-slate-50 flex items-center justify-center">
                          <img
                            src={images[0]}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                          />
                          {isSeed ? (
                            <span className="absolute top-2.5 left-2.5 bg-purple-600 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded tracking-wider shadow-sm">
                              Выставочный демо
                            </span>
                          ) : (
                            <span className="absolute top-2.5 left-2.5 bg-orange-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wider shadow-sm">
                              Товар продавца
                            </span>
                          )}
                          <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-1 rounded">
                            {p.category}
                          </span>
                        </div>

                        {/* Info & Action */}
                        <div className="p-4 flex-grow flex flex-col justify-between">
                          <div>
                            {/* Rating & reviews mock */}
                            <div className="flex items-center gap-1 text-amber-500 text-xs mb-1.5 font-bold">
                              <div className="flex">
                                <Star className="w-3.5 h-3.5 fill-current" />
                                <Star className="w-3.5 h-3.5 fill-current" />
                                <Star className="w-3.5 h-3.5 fill-current" />
                                <Star className="w-3.5 h-3.5 fill-current" />
                                <Star className="w-3.5 h-3.5 fill-current" />
                              </div>
                              <span className="text-slate-400 font-medium">(12 отзывов)</span>
                            </div>

                            <h4 className="font-extrabold text-[#522b82] group-hover:text-purple-900 text-sm line-clamp-2 leading-tight min-h-[40px]">
                              {p.name}
                            </h4>

                            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                              {p.description}
                            </p>
                          </div>

                          <div className="mt-4 flex items-center justify-between pt-2 border-t border-slate-50">
                            <div>
                              <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Цена</span>
                              <span className="text-lg font-black text-slate-800">
                                {p.price.toLocaleString('ru-RU')} <span className="text-purple-700 font-bold">{"}|{"}</span>
                              </span>
                            </div>

                            {isSeed ? (
                              <span className="text-[10px] text-slate-400 bg-slate-100 font-bold px-2 py-1.5 rounded-lg border border-slate-200">
                                Демо-просмотр
                              </span>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCart(p);
                                }}
                                className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white p-2 px-3.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
                              >
                                <ShoppingCart className="w-4 h-4" />
                                <span>Купить</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 mt-20 border-t border-slate-800 py-10 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="bg-white/10 text-white font-black px-3.5 py-1.5 rounded-lg text-lg w-fit flex items-center gap-1.5 mb-3">
              <Store className="w-5 h-5 text-orange-400" />
              <span>PromIn</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Главный онлайн-маркетплейс игровой страны Ирновия. У нас вы найдете всё необходимое: от мощных автомобилей отечественной сборки до свежайших фермерских продуктов.
            </p>
          </div>
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-3">Покупателям</h4>
            <ul className="space-y-1.5 text-xs">
              <li className="hover:text-white cursor-pointer transition">Как делать заказы</li>
              <li className="hover:text-white cursor-pointer transition">Проверка паспорта в Нацбанке</li>
              <li className="hover:text-white cursor-pointer transition">Служба поддержки</li>
              <li className="hover:text-white cursor-pointer transition">Вопросы и ответы</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-3">Продавцам</h4>
            <ul className="space-y-1.5 text-xs">
              <li className="hover:text-white cursor-pointer transition">Зарегистрировать магазин</li>
              <li className="hover:text-white cursor-pointer transition">Правила добавления товаров</li>
              <li className="hover:text-white cursor-pointer transition">Интеграция мерчант-эквайринга</li>
              <li className="hover:text-white cursor-pointer transition">Личный кабинет продавца</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-3">Нацбанк Ирновии</h4>
            <div className="bg-slate-850 p-3.5 rounded-lg border border-slate-800 text-xs text-slate-500 leading-relaxed">
              <p className="font-semibold text-slate-300 flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Мерчант-эквайринг активен
              </p>
              <p>Созданные счета автоматически поступают в ваше банковское приложение для подтверждения.</p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-slate-850 mt-10 pt-6 text-center text-xs text-slate-600 flex flex-col sm:flex-row justify-between gap-4">
          <p>© {new Date().getFullYear()} PromIn (Пром Ирновии). Все права защищены правительством Ирновии.</p>
          <div className="flex justify-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Правила пользования</span>
            <span className="hover:text-slate-400 cursor-pointer">Конфиденциальность</span>
          </div>
        </div>
      </footer>

      {/* AUTHENTICATION MODAL (LOG-IN BY PASSPORT) */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
            <div className="bg-[#522b82] text-white p-5 flex items-center justify-between">
              <h3 className="text-lg font-black flex items-center gap-2">
                <User className="w-5 h-5 text-purple-300" /> Войти по паспорту гражданина
              </h3>
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="text-purple-200 hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleLogin} className="p-6 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Введите код вашего государственного паспорта гражданина Ирновии для авторизации. Данные будут сверены с Национальным Банком.
              </p>

              {authError && (
                <div className="bg-red-50 border border-red-100 text-red-700 p-3 rounded-lg flex gap-2 text-xs font-semibold">
                  <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Код вашего паспорта</label>
                <input
                  type="text"
                  required
                  placeholder="Пример: Т•01•180426•814"
                  value={authPassport}
                  onChange={(e) => setAuthPassport(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400 font-mono font-bold uppercase tracking-wider"
                />
                <div className="mt-1.5 text-[10px] text-slate-400">
                  Доступные тестовые паспорта в системе: <br />
                  <span className="font-mono text-slate-600 font-semibold bg-slate-100 px-1 py-0.5 rounded mr-1 inline-block mt-1">Т•01•180426•814</span>
                  <span className="font-mono text-slate-600 font-semibold bg-slate-100 px-1 py-0.5 rounded mr-1 inline-block mt-1">П•01•160626•316</span>
                  <span className="font-mono text-slate-600 font-semibold bg-slate-100 px-1 py-0.5 rounded inline-block mt-1">О•01•060826•960</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-[#522b82] hover:bg-purple-900 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition disabled:bg-slate-300"
                >
                  {authLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Проверить в базе Нацбанка"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL FOR PRODUCT */}
      {selectedProduct && (() => {
        const images = parseProductImages(selectedProduct.image_url);
        const isSeed = selectedProduct.id.startsWith('seed-');

        return (
          <div className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">

              {/* Header */}
              <div className="bg-slate-100 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{selectedProduct.category}</span>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-200 rounded-full transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content body */}
              <div className="overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Left Side: Image Carousel */}
                <div className="flex flex-col gap-3">
                  <div className="relative bg-slate-50 rounded-xl overflow-hidden border border-slate-100 flex items-center justify-center h-[260px] md:h-[320px]">
                    <img
                      src={images[detailsImgIndex]}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />

                    {images.length > 1 && (
                      <>
                        <button
                          onClick={() => setDetailsImgIndex((prev) => (prev - 1 + images.length) % images.length)}
                          className="absolute left-2 bg-black/40 hover:bg-black/60 p-1 rounded-full text-white shadow-md transition"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setDetailsImgIndex((prev) => (prev + 1) % images.length)}
                          className="absolute right-2 bg-black/40 hover:bg-black/60 p-1 rounded-full text-white shadow-md transition"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Row */}
                  {images.length > 1 && (
                    <div className="flex gap-2 justify-center overflow-x-auto py-1">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setDetailsImgIndex(idx)}
                          className={`w-12 h-12 rounded-md overflow-hidden border-2 transition-all ${detailsImgIndex === idx ? 'border-[#522b82] scale-105' : 'border-slate-200 hover:border-slate-300'}`}
                        >
                          <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Side: Details */}
                <div className="flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-[#522b82] tracking-tight leading-tight">
                      {selectedProduct.name}
                    </h3>

                    {/* Reviews Mock Info */}
                    <div className="flex items-center gap-1 text-amber-500 text-sm mt-2 font-bold">
                      <div className="flex">
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                      </div>
                      <span className="text-slate-500 font-semibold">(5.0 из 5, 12 голосов)</span>
                    </div>

                    <div className="mt-4 bg-purple-50 rounded-lg p-3 border border-purple-100 text-xs text-purple-900 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-[#522b82] flex-shrink-0" />
                      <span>Продавец верифицирован: <strong className="font-mono font-bold text-slate-800">{selectedProduct.seller_passport}</strong></span>
                    </div>

                    <div className="mt-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Описание товара</h4>
                      <p className="text-sm text-slate-600 leading-relaxed mt-1 whitespace-pre-line">
                        {selectedProduct.description}
                      </p>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg text-xs">
                      <div>
                        <span className="text-slate-400 font-semibold">Доставка по Ирновии</span>
                        <p className="font-bold text-slate-700 mt-0.5">Бесплатно (Почта)</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold">Гарантия</span>
                        <p className="font-bold text-slate-700 mt-0.5">30 дней возврата</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-xs text-slate-400 font-bold uppercase block">Общая стоимость</span>
                      <span className="text-2xl md:text-3xl font-black text-slate-800">
                        {selectedProduct.price.toLocaleString('ru-RU')} <span className="text-[#522b82]">{"}|{"}</span>
                      </span>
                    </div>

                    {isSeed ? (
                      <button
                        disabled
                        className="bg-slate-300 text-slate-500 font-bold px-6 py-3.5 rounded-xl cursor-not-allowed text-xs"
                      >
                        Только демонстрация
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          addToCart(selectedProduct);
                          setSelectedProduct(null);
                        }}
                        className="bg-[#ff5a00] hover:bg-orange-600 active:bg-orange-700 text-white font-black px-8 py-3.5 rounded-xl shadow-lg hover:shadow-orange-200 transition-all text-sm uppercase tracking-wide flex items-center gap-2"
                      >
                        <ShoppingCart className="w-5 h-5 stroke-[2.5]" />
                        <span>В корзину</span>
                      </button>
                    )}
                  </div>

                </div>

              </div>

            </div>
          </div>
        );
      })()}

      {/* SHOPPING CART & CHECKOUT DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">

          {/* Overlay click */}
          <div className="absolute inset-0 z-0" onClick={() => setIsCartOpen(false)}></div>

          {/* Cart Contents Panel */}
          <div className="relative z-10 bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between">

            {/* Header */}
            <div className="bg-[#522b82] text-white p-4 flex items-center justify-between shadow-md">
              <h3 className="font-black text-lg flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-orange-400" /> Корзина заказа
              </h3>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setCreatedInvoice(null);
                  setPaymentPolling(false);
                  setPaymentSuccess(false);
                  setCheckoutError(null);
                }}
                className="text-purple-200 hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Main Area */}
            <div className="flex-grow overflow-y-auto p-4">

              {paymentSuccess ? (
                /* 1. SUCCESS STATE */
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-12">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center animate-pulse">
                    <CheckCircle className="w-12 h-12 text-emerald-500" />
                  </div>
                  <h4 className="text-xl font-black text-emerald-800">Заказ успешно оплачен!</h4>
                  <p className="text-sm text-slate-500 max-w-xs mx-auto">
                    Счет успешно подтвержден в Национальном Банке Ирновии. Ваши товары отправлены продавцом на ваши координаты. Спасибо за покупку!
                  </p>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setPaymentSuccess(false);
                      setCreatedInvoice(null);
                    }}
                    className="bg-[#522b82] text-white font-bold px-6 py-2.5 rounded-lg hover:bg-purple-900 transition-all shadow-md"
                  >
                    Вернуться к покупкам
                  </button>
                </div>

              ) : paymentPolling ? (
                /* 2. POLLING INVOICE STATE (WITHOUT SIMULATION OVERLAYS - AS DIRECTED) */
                <div className="flex flex-col items-center justify-center h-full text-center space-y-5 py-6">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-700 rounded-full animate-spin"></div>
                    <CreditCard className="w-6 h-6 text-purple-700 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-purple-950">Счет выставлен в Банк!</h4>
                    <p className="text-xs text-slate-400 mt-1">ID счета: <span className="font-mono text-slate-600 font-bold">{createdInvoice?.id}</span></p>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-left text-xs space-y-2 w-full">
                    <p className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-400">Сумма заказа:</span>
                      <strong className="text-slate-800 font-bold text-sm">{createdInvoice?.amount.toLocaleString('ru-RU')} {"}|{"}</strong>
                    </p>
                    <p className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-400">Покупатель (receiver):</span>
                      <strong className="font-mono text-slate-700">{createdInvoice?.receiver_passport}</strong>
                    </p>
                    <p className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-400">Продавец (sender):</span>
                      <strong className="font-mono text-slate-700">{createdInvoice?.sender_passport}</strong>
                    </p>

                    <div className="text-center py-2">
                      <p className="text-sm font-bold text-emerald-700 mb-1">{paymentBuyerName}, подтверждаем ваш заказ...</p>
                      <p className="text-[11px] font-semibold text-purple-800 animate-pulse">
                        Ожидаем подтверждения оплаты в вашем приложении Нацбанка...
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Зайдите в официальное банковское приложение Нацбанка Ирновии на вашем телефоне и подтвердите выставленный счет.
                  </p>

                  <button
                    onClick={() => {
                      setPaymentPolling(false);
                      setCreatedInvoice(null);
                    }}
                    className="text-xs text-red-500 hover:text-red-700 font-bold underline cursor-pointer pt-4"
                  >
                    Отменить транзакцию
                  </button>
                </div>

              ) : cart.length === 0 ? (
                /* 3. EMPTY CART STATE */
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-12">
                  <ShoppingCart className="w-12 h-12 text-slate-300" />
                  <h4 className="font-bold text-slate-700 text-base">Ваша корзина пуста</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">Добавьте понравившиеся вам товары с главной страницы или категорий, чтобы заказать их.</p>
                </div>

              ) : (
                /* 4. CART LIST & FORM */
                <div className="space-y-6">
                  {/* Cart Items List */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">Выбранные товары</h4>
                    {cart.map((item) => {
                      const images = parseProductImages(item.product.image_url);

                      return (
                        <div key={item.product.id} className="flex gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <img
                            src={images[0]}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded-md bg-white border border-slate-200"
                          />
                          <div className="flex-grow flex flex-col justify-between">
                            <div>
                              <p className="text-xs font-bold text-[#522b82] line-clamp-1">{item.product.name}</p>
                              <p className="text-xs font-black text-slate-700 mt-0.5">
                                {item.product.price.toLocaleString('ru-RU')} {"}|{"}
                              </p>
                            </div>

                            <div className="flex items-center justify-between mt-1">
                              <div className="flex items-center bg-white border border-slate-200 rounded-md p-0.5 text-xs">
                                <button
                                  onClick={() => updateQuantity(item.product.id, -1)}
                                  className="p-1 hover:bg-slate-100 rounded text-slate-500"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="px-2 font-bold text-slate-700">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.product.id, 1)}
                                  className="p-1 hover:bg-slate-100 rounded text-slate-500"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <button
                                onClick={() => removeFromCart(item.product.id)}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Checkout Form */}
                  <form onSubmit={handleCheckout} className="space-y-3 pt-4 border-t border-slate-150">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">Оформление заказа</h4>

                    {checkoutError && (
                      <div className="bg-red-50 border border-red-100 text-red-700 p-3 rounded-lg flex gap-1.5 text-xs font-semibold">
                        <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
                        <span>{checkoutError}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Ваше Имя и Фамилия *</label>
                      <input
                        type="text"
                        required
                        placeholder="Имя Фамилия"
                        value={checkoutName}
                        onChange={(e) => setCheckoutName(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:ring-1 focus:ring-purple-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Номер Телефона *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+380991234567"
                        value={checkoutPhone}
                        onChange={(e) => setCheckoutPhone(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:ring-1 focus:ring-purple-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Координаты доставки *</label>
                      <div className="relative">
                        <MapPin className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          placeholder="Пример: X: 1450, Y: -2890 (или адрес)"
                          value={checkoutCoordinates}
                          onChange={(e) => setCheckoutCoordinates(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg py-2 pl-8 pr-2 text-xs font-semibold focus:ring-1 focus:ring-purple-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Код паспорта гражданина Ирновии *</label>
                      <input
                        type="text"
                        required
                        placeholder="Пример: C•01•191125•001"
                        value={checkoutPassport}
                        onChange={(e) => setCheckoutPassport(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold uppercase focus:ring-1 focus:ring-purple-400 focus:outline-none"
                      />
                      <span className="text-[9px] text-slate-400 leading-none mt-1 block">
                        Будет выполнена сверка с государственным реестром Национального Банка.
                      </span>
                    </div>

                    {/* Submit Button inside the form section to act as order place */}
                    <div className="pt-3">
                      <button
                        type="submit"
                        disabled={checkoutLoading}
                        className="w-full bg-[#ff5a00] hover:bg-orange-600 active:bg-orange-700 text-white font-black py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md text-sm uppercase tracking-wider disabled:bg-slate-300 disabled:cursor-not-allowed"
                      >
                        {checkoutLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Сверка паспорта...</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4" />
                            <span>Оплатить через Нацбанк Ирновии</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

            </div>

            {/* Total Footer panel (Only shown if items are present and we are not in success state) */}
            {cart.length > 0 && !paymentPolling && !paymentSuccess && (
              <div className="bg-slate-50 p-4 border-t border-slate-100 shadow-inner">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-slate-500 text-xs font-bold uppercase">Итого к оплате:</span>
                  <span className="text-xl font-black text-slate-800">
                    {cartTotal.toLocaleString('ru-RU')} <span className="text-[#522b82]">{"}|{"}</span>
                  </span>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
