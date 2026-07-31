export interface Product {
  id: number;

  slug: string;

  name: string;

  category: string;

  description?: string;

  price: number;

  compareAtPrice?: number;

  image: string;

  badge?: string;

  rating: number;

  reviewCount: number;

  inStock: boolean;
}