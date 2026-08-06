import { supabase } from './supabaseClient';
import type { Product } from './supabaseClient';

const SEED_PRODUCTS: Product[] = [
  {
    id: "seed-car-1",
    name: "[ДЕМО] Ирни Моторс Седан GT-6",
    description: "Премиальный седан ирновийского производства. Обладает мощным двигателем на 340 л.с., кожаным салоном вишневого цвета, мультимедийной системой нового поколения и полным приводом. Ирновийский шик и комфорт. (Демонстрационный товар, покупка заблокирована)",
    price: 120000,
    category: "Автомобили и мото",
    image_url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80",
    seller_passport: "Т•01•180426•814",
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: "seed-car-2",
    name: "[ДЕМО] Байк Ирновия Спорт V2",
    description: "Спортивный мотоцикл для любителей скорости и адреналина. 1000 кубических сантиметров, разгон до 100 км/ч за 2.8 секунды. Маневренный, легкий и очень стильный. (Демонстрационный товар, покупка заблокирована)",
    price: 45000,
    category: "Автомобили и мото",
    image_url: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80",
    seller_passport: "О•01•060826•960",
    created_at: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: "seed-furniture-1",
    name: "[ДЕМО] Диван Президентский Велюр",
    description: "Роскошный угловой диван с обивкой из итальянского велюра изумрудного цвета. Мягкие подушки с эффектом памяти, прочный каркас из массива дуба. Станет украшением любого интерьера. (Демонстрационный товар, покупка заблокирована)",
    price: 18000,
    category: "Мебель и интерьер",
    image_url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80",
    seller_passport: "Т•01•180426•814",
    created_at: new Date(Date.now() - 3600000 * 48).toISOString()
  },
  {
    id: "seed-furniture-2",
    name: "[ДЕМО] Светодиодный светильник Горизонт",
    description: "Дизайнерский подвесной светильник с регулировкой яркости и цветовой температуры через смартфон. Энергосберегающий, минималистичный, идеально подходит для рабочих столов и обеденных зон. (Демонстрационный товар, покупка заблокирована)",
    price: 12000,
    category: "Мебель и интерьер",
    image_url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80",
    seller_passport: "О•01•060826•960",
    created_at: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: "seed-style-1",
    name: "[ДЕМО] Худи Оверсайз 'Ирновия Стрит'",
    description: "Теплый и мягкий худи из плотного футера с начесом. Уникальный принт с символикой Ирновии на груди. Карманы кенгуру, объемный капюшон. (Демонстрационный товар, покупка заблокирована)",
    price: 1500,
    category: "Одежда и стиль",
    image_url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80",
    seller_passport: "П•01•160626•316",
    created_at: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    id: "seed-style-2",
    name: "[ДЕМО] Кроссовки Runner Pro Active",
    description: "Оригинальные кроссовки для бега и повседневной носки. Амортизирующая подошва, дышащая сетчатая ткань, поддержка стопы при интенсивных нагрузках. (Демонстрационный товар, покупка заблокирована)",
    price: 4200,
    category: "Одежда и стиль",
    image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
    seller_passport: "Т•01•180426•814",
    created_at: new Date(Date.now() - 3600000 * 18).toISOString()
  },
  {
    id: "seed-electro-1",
    name: "[ДЕМО] Смартфон IrnPhone 15 Pro",
    description: "Флагманский smartphone ирновийской сборки. Экран Super Retina XDR 120 Гц, тройная камера 48 Мп с оптическим зумом, мощный процессор IrnChip, надежная батарея. (Демонстрационный товар, покупка заблокирована)",
    price: 35000,
    category: "Электроника",
    image_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
    seller_passport: "П•01•160626•316",
    created_at: new Date(Date.now() - 3600000 * 36).toISOString()
  },
  {
    id: "seed-electro-2",
    name: "[ДЕМО] Наушники SilentSpace Wireless",
    description: "Полноразмерные беспроводные наушники с активным гибридным шумоподавлением. До 40 часов работы от одного заряда, HI-RES аудио, ультрамягкие амбушюры. (Демонстрационный товар, покупка заблокирована)",
    price: 8500,
    category: "Электроника",
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
    seller_passport: "О•01•060826•960",
    created_at: new Date().toISOString()
  },
  {
    id: "seed-service-1",
    name: "[ДЕМО] Разработка Smart-контрактов Ирновии",
    description: "Разработаем безопасные, оптимизированные смарт-контракты для ваших проектов в Ирновии. Полный аудит кода, оптимизация потребления газа, развертывание в сети. (Демонстрационный товар, покупка заблокирована)",
    price: 15000,
    category: "Услуги",
    image_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
    seller_passport: "Т•01•180426•814",
    created_at: new Date(Date.now() - 3600000 * 20).toISOString()
  },
  {
    id: "seed-service-2",
    name: "[ДЕМО] Профессиональный клининг 'Чистый Дом'",
    description: "Генеральная уборка квартир, офисов и коттеджей. Профессиональная гипоаллергенная химия, опытные сотрудники, быстрая и качественная уборка под ключ. (Демонстрационный товар, покупка заблокирована)",
    price: 1800,
    category: "Услуги",
    image_url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80",
    seller_passport: "П•01•160626•316",
    created_at: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: "seed-food-1",
    name: "[ДЕМО] Ирновийский горный сыр Резерв",
    description: "Твердый сыр долгой выдержки (12 месяцев) из отборного молока коров, пасущихся на экологически чистых горных пастбищах Ирновии. Насыщенный пикантный вкус. (Демонстрационный товар, покупка заблокирована)",
    price: 450,
    category: "Продукты питания",
    image_url: "https://images.unsplash.com/photo-1486299267070-83823f5448dd?auto=format&fit=crop&w=600&q=80",
    seller_passport: "О•01•060826•960",
    created_at: new Date(Date.now() - 3600000 * 15).toISOString()
  },
  {
    id: "seed-food-2",
    name: "[ДЕМО] Подарочный набор шоколада премиум",
    description: "Изысканный шоколад ручной работы от лучших ирновийских кондитеров. В наборе: темный шоколад с солью, молочный с орехами пекан, белый с малиной. (Демонстрационный товар, покупка заблокирована)",
    price: 850,
    category: "Продукты питания",
    image_url: "https://images.unsplash.com/photo-1548907040-4d42b52125e0?auto=format&fit=crop&w=600&q=80",
    seller_passport: "П•01•160626•316",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

export async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('marketplace_products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn("Supabase products fetch error, falling back to LocalStorage:", error.message);
      return getLocalProducts();
    }

    if (data && data.length > 0) {
      localStorage.setItem('promin_products', JSON.stringify(data));
      return data as Product[];
    } else {
      return getLocalProducts();
    }
  } catch (err) {
    console.warn("Supabase products request failed, falling back to LocalStorage:", err);
    return getLocalProducts();
  }
}

function getLocalProducts(): Product[] {
  const local = localStorage.getItem('promin_products');
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      // ignore
    }
  }
  localStorage.setItem('promin_products', JSON.stringify(SEED_PRODUCTS));
  return SEED_PRODUCTS;
}

export async function addProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
  const newProduct: Product = {
    ...product,
    id: `prod-${Math.random().toString(36).substr(2, 9)}`,
    created_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('marketplace_products')
      .insert([newProduct])
      .select();

    if (error) {
      console.warn("Failed to insert product in Supabase, saving locally:", error.message);
      return saveLocalProduct(newProduct);
    }

    if (data && data.length > 0) {
      await getProducts();
      return data[0] as Product;
    }
  } catch (err) {
    console.warn("Supabase product insertion failed, saving locally:", err);
  }

  return saveLocalProduct(newProduct);
}

function saveLocalProduct(product: Product): Product {
  const current = getLocalProducts();
  const updated = [product, ...current];
  localStorage.setItem('promin_products', JSON.stringify(updated));
  return product;
}
