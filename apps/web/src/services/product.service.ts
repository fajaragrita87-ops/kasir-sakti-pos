import api from '../lib/api';

export const productService = {
  getProducts: async (outletId?: string) => {
    const response = await api.get('/products', { params: { outletId } });
    return response.data;
  },
  
  createProduct: async (data: any) => {
    const response = await api.post('/products', data);
    return response.data;
  },
  
  updateProduct: async (id: string, data: any) => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },
  
  deleteProduct: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
  
  getCategories: async (outletId?: string) => {
    const response = await api.get('/products/categories', { params: { outletId } });
    return response.data;
  }
};
