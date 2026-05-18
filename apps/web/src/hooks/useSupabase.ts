/**
 * useSupabaseProducts — Hook untuk sinkronisasi produk dengan Supabase
 * Digunakan di InventoryPage dan POSScreen
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/auth.store';
import type { Product } from '../stores/product.store';

export function useSupabaseProducts() {
  const { user } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Ambil semua produk dari Supabase ─────────────────────────
  const fetchProducts = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map dari format Supabase (snake_case) ke format app (camelCase)
      const mapped: Product[] = (data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        cost: p.cost,
        stock: p.stock,
        category: p.category,
        sku: p.sku || '',
        imageUrl: p.image_url,
        isActive: p.is_active,
        description: p.description,
        unit: p.unit || 'pcs',
        isComposite: p.is_composite || false,
      }));
      setProducts(mapped);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ── Tambah Produk ──────────────────────────────────────────
  const addProduct = async (p: Omit<Product, 'id'>) => {
    if (!user?.id) return;
    const { data, error } = await supabase.from('products').insert({
      owner_id: user.id,
      name: p.name,
      price: p.price,
      cost: p.cost,
      stock: p.stock,
      category: p.category,
      sku: p.sku,
      image_url: p.imageUrl,
      is_active: p.isActive,
      description: p.description,
      unit: p.unit,
      is_composite: p.isComposite,
    }).select().single();

    if (error) throw error;
    await fetchProducts();
    return data;
  };

  // ── Update Produk ──────────────────────────────────────────
  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const { error } = await supabase.from('products').update({
      name: updates.name,
      price: updates.price,
      cost: updates.cost,
      stock: updates.stock,
      category: updates.category,
      sku: updates.sku,
      image_url: updates.imageUrl,
      is_active: updates.isActive,
      description: updates.description,
      unit: updates.unit,
      updated_at: new Date().toISOString(),
    }).eq('id', id);

    if (error) throw error;
    await fetchProducts();
  };

  // ── Hapus Produk ───────────────────────────────────────────
  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    await fetchProducts();
  };

  // ── Kurangi Stok setelah Transaksi ────────────────────────
  const reduceStock = async (id: string, qty: number) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    await updateProduct(id, { stock: Math.max(0, product.stock - qty) });
  };

  return { products, loading, error, fetchProducts, addProduct, updateProduct, deleteProduct, reduceStock };
}

/**
 * useSupabaseTransactions — Hook untuk menyimpan dan membaca transaksi POS
 */
export function useSupabaseTransactions() {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = useCallback(async (limit = 50) => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setTransactions(data || []);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // ── Simpan Transaksi POS ─────────────────────────────────
  const saveTransaction = async (tx: {
    items: any[];
    subtotal: number;
    discount: number;
    total: number;
    paymentMethod: string;
    amountPaid: number;
    changeAmount: number;
    cashierName: string;
    note?: string;
  }) => {
    if (!user?.id) throw new Error('Tidak ada sesi user');

    const { data, error } = await supabase.from('transactions').insert({
      owner_id: user.id,
      items: tx.items,
      subtotal: tx.subtotal,
      discount: tx.discount,
      total: tx.total,
      payment_method: tx.paymentMethod,
      amount_paid: tx.amountPaid,
      change_amount: tx.changeAmount,
      cashier_name: tx.cashierName,
      note: tx.note || null,
    }).select().single();

    if (error) throw error;
    return data;
  };

  return { transactions, loading, fetchTransactions, saveTransaction };
}
