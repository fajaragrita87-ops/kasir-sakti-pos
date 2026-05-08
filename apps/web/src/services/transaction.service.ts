import api from '../lib/api';

export const transactionService = {
  createTransaction: async (data: any) => {
    const response = await api.post('/transactions', data);
    return response.data;
  },
  
  getTransactions: async (outletId?: string) => {
    const response = await api.get('/transactions', { params: { outletId } });
    return response.data;
  },
  
  getDailyStats: async (outletId: string) => {
    const response = await api.get('/transactions/stats/daily', { params: { outletId } });
    return response.data;
  }
};
