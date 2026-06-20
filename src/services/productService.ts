import api from './api';
import { Product, Category } from '../types';

export interface ProductsResponse {
  success: boolean;
  count: number;
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
  products: any[]; // Raw products from backend to be normalized
}

export interface SingleProductResponse {
  success: boolean;
  product: any;
}

export interface CategoriesResponse {
  success: boolean;
  count: number;
  categories: Category[];
}

export interface SingleCategoryResponse {
  success: boolean;
  category: Category;
}

/**
 * Normalizes a product returned by the backend (which uses object-based images and populated category)
 * down to the flat models expected by our UI.
 */
export const normalizeProduct = (prod: any): Product => {
  if (!prod) return prod;
  return {
    _id: prod._id,
    name: prod.name,
    slug: prod.slug || '',
    sku: prod.sku || '',
    description: prod.description || '',
    price: prod.price,
    originalPrice: prod.discountPrice || prod.price, // Maps discountPrice as standard originalPrice in view
    images: Array.isArray(prod.images)
      ? prod.images.map((img: any) => typeof img === 'string' ? img : (img.secureUrl || img.url || ''))
      : [],
    stock: prod.stock ?? 0,
    sizes: prod.sizes || [],
    colors: prod.colors || [],
    category: typeof prod.category === 'object' && prod.category !== null
      ? prod.category._id || prod.category
      : prod.category || '',
    isActive: prod.isActive ?? true,
    views: prod.views || 0,
    rating: prod.rating || 5,
    reviews: prod.reviews || [],
    createdAt: prod.createdAt,
  };
};

export const productService = {
  /**
   * Fetch all active / searchable products with filters
   */
  getProducts: async (filters?: {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    featured?: boolean;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<{ products: Product[]; pagination: ProductsResponse['pagination'] }> => {
    const response = await api.get<ProductsResponse>('/products', { params: filters });
    const normalized = (response.data.products || []).map(normalizeProduct);
    return {
      products: normalized,
      pagination: response.data.pagination,
    };
  },

  /**
   * Fetch a single product by its ObjectId or web URL Slug
   */
  getProductByIdOrSlug: async (idOrSlug: string): Promise<Product> => {
    const response = await api.get<SingleProductResponse>(`/products/${idOrSlug}`);
    return normalizeProduct(response.data.product);
  },

  /**
   * Admin Mode: Create a brand new product
   * Accepts standard JSON object or a multipart FormData (for custom picture file streams setup)
   */
  createProduct: async (productData: any): Promise<Product> => {
    const headers = productData instanceof FormData 
      ? { 'Content-Type': 'multipart/form-data' } 
      : undefined;

    const response = await api.post<SingleProductResponse>('/products', productData, { headers });
    return normalizeProduct(response.data.product);
  },

  /**
   * Admin Mode: Update an existing product
   * Accepts standard JSON object or a multipart FormData (allowing additional picture files)
   */
  updateProduct: async (id: string, productData: any): Promise<Product> => {
    const headers = productData instanceof FormData 
      ? { 'Content-Type': 'multipart/form-data' } 
      : undefined;

    const response = await api.put<SingleProductResponse>(`/products/${id}`, productData, { headers });
    return normalizeProduct(response.data.product);
  },

  /**
   * Admin Mode: Delete a product from inventory
   */
  deleteProduct: async (id: string): Promise<boolean> => {
    const response = await api.delete<{ success: boolean }>(`/products/${id}`);
    return response.data.success;
  },

  /**
   * General: Fetch list of fashion categories
   */
  getCategories: async (activeOnly = false): Promise<Category[]> => {
    const params = activeOnly ? { active: 'true' } : undefined;
    const response = await api.get<CategoriesResponse>('/categories', { params });
    return response.data.categories || [];
  },

  /**
   * Admin: Create a new category
   */
  createCategory: async (categoryData: Omit<Category, '_id' | 'slug'>): Promise<Category> => {
    const response = await api.post<SingleCategoryResponse>('/categories', categoryData);
    return response.data.category;
  },

  /**
   * Admin: Update category
   */
  updateCategory: async (id: string, categoryData: Partial<Category>): Promise<Category> => {
    const response = await api.put<SingleCategoryResponse>(`/categories/${id}`, categoryData);
    return response.data.category;
  },

  /**
   * Admin: Delete category
   */
  deleteCategory: async (id: string): Promise<boolean> => {
    const response = await api.delete<{ success: boolean }>(`/categories/${id}`);
    return response.data.success;
  },
};

export default productService;
