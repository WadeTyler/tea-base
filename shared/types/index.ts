export interface User {
  user_id: string;
  name: string;
  email: string;
  password?: string;
  role: "member" | "admin" | "super-admin";
  created_at: string;
}

export interface Category {
  category_id: number;
  name: string;
  label: string;
}

export interface Product {
  product_id: string;
  category_id: number;
  name: string;
  price: number;
  stock: number;
  description: string;
  is_featured: boolean;
  stars: number;
  sales_percentage: number;
  created_at: string;


  // Frontend side
  product_images?: ProductImage[];
  image?: string;
  quantity?: number;
}

export interface ProductImage {
  product_image_id: number;
  product_id: string;
  image: string;
  image_order: number;
}

export interface Coupon {
  coupon_id: string;
  discount: number;
  expiration: string;
  is_active: boolean;
}

export interface Review {
  review_id: string;
  product_id: string;
  user_id: string;
  timestamp: string;
  rating: number;
  summary: string;
  content: string;

  // additional fields for frontend
  name?: string;
}

export interface SystemLog {
  system_log_id: number;
  user_id: string;
  timestamp: string;
  log: string;
}


export interface LineItem {
  price_data: {
    currency: string;
    product_data: {
      name: string;
      images: string[];
    },
    unit_amount: number,
  },
  quantity: number,
}