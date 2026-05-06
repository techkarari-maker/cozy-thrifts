interface Product {
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

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface Testimonial {
  quote: string;
  author: string;
}

type DisableableElement = HTMLElement & {
  disabled: boolean;
};

interface Window {
  PRODUCTS: Product[];
  editProduct: (productId: string) => void;
}
