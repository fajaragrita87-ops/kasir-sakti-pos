import { Request, Response } from 'express';
import { prisma } from '../index';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { outletId } = req.query;
    const products = await prisma.product.findMany({
      where: outletId ? { outletId: String(outletId) } : {},
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { outletId, name, price, stock, categoryId, sku } = req.body;
    const product = await prisma.product.create({
      data: {
        outletId,
        name,
        price: Number(price),
        stock: Number(stock),
        sku,
        categoryId
      }
    });
    res.status(201).json(product);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        price: data.price ? Number(data.price) : undefined,
        stock: data.stock ? Number(data.stock) : undefined,
      }
    });
    res.json(product);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Produk berhasil dihapus' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const { outletId } = req.query;
    const categories = await prisma.category.findMany({
      where: outletId ? { outletId: String(outletId) } : {}
    });
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
