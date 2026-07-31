import type { Product } from "@/types/product";

export const products: Product[] = [
  {
    id: 1,
    slug: "macbook-air-m3",
    name: "MacBook Air M3",
    category: "Laptop",
    price: 1299,
    compareAtPrice: 1499,
    image: "/images/products/macbook.webp",
    badge: "New",
    rating: 4.9,
    reviewCount: 124,
    inStock: true,
  },

  {
    id: 2,
    slug: "iphone-16",
    name: "iPhone 16",
    category: "Phone",
    price: 999,
    compareAtPrice: 1099,
    image: "/images/products/iphone.webp",
    badge: "Sale",
    rating: 4.8,
    reviewCount: 92,
    inStock: true,
  },

  {
    id: 3,
    slug: "sony-wh1000xm6",
    name: "Sony WH-1000XM6",
    category: "Headphones",
    price: 399,
    compareAtPrice: 449,
    image: "/images/products/headphones.webp",
    badge: "Hot",
    rating: 4.9,
    reviewCount: 210,
    inStock: true,
  },

  {
    id: 4,
    slug: "keychron-q1",
    name: "Keychron Q1",
    category: "Keyboard",
    price: 199,
    compareAtPrice: 229,
    image: "/images/products/keyboard.webp",
    rating: 4.7,
    reviewCount: 81,
    inStock: true,
  },
];