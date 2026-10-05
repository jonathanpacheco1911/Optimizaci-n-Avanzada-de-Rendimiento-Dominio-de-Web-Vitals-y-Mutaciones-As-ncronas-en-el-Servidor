export type User = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
};

export type Product = {
  id: number;
  name: string;
  description: string | null;
  // Laravel puede serializar decimales como string ("29.99")
  price: string | number;
  stock: number;
  sku: string;
  image_url: string | null;
  is_active: boolean;
};

// Formato del paginador de Laravel (dentro de { success, message, data })
export type Paginated<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type OrderItem = {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: string | number;
  subtotal: string | number;
  product?: Product | null;
};

export type Payment = {
  id: number;
  order_id: number;
  stripe_payment_intent_id: string;
  amount: string | number;
  currency: string;
  status: string;
};

export type Order = {
  id: number;
  user_id: number;
  status: string; // pending | paid | failed
  total: string | number;
  currency: string;
  created_at: string;
  items?: OrderItem[];
  payment?: Payment | null;
};
