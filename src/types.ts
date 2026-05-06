export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  size: string;
  condition: string;
  slug: string;
  description: string;
  images: string[];
  tags: string[];
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface Testimonial {
  quote: string;
  author: string;
}

declare global {
  interface Window {
    PRODUCTS: Product[];
    addToCartFromCard: (productId: string) => void;
    selectProductImage: (index: number) => void;
    orderNow: (productId: string) => void;
    updateQuantity: (index: number, value: string) => void;
    removeCartItem: (index: number) => void;
    editProduct: (productId: string) => void;
    deleteProduct: (productId: string) => void;
    handleAdminLogin: (event: SubmitEvent) => void;
  }
}
