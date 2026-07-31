import { products } from "@/data/products";

export function getProducts() {
    return products;
}

export function getProductBySlug(slug: string) {
    return products.find(p => p.slug === slug);
}