import { Request, Response } from 'express';
import { prisma } from '../index';

export const createTransaction = async (req: Request, res: Response) => {
  try {
    const { 
      outletId, userId, customerId, 
      items, subtotal, discount, 
      taxAmount, serviceAmount, total, 
      paymentMethod, paymentAmount, change 
    } = req.body;

    // Use a transaction to ensure stock is updated correctly
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Transaction
      const transaction = await tx.transaction.create({
        data: {
          outletId,
          userId,
          customerId,
          subtotal,
          discount,
          taxAmount,
          serviceAmount,
          total,
          paymentMethod,
          paymentAmount,
          change,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              productName: item.productName,
              productPrice: item.productPrice,
              quantity: item.quantity,
              subtotal: item.subtotal
            }))
          }
        }
      });

      // 2. Update Stocks
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }

      return transaction;
    });

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const { outletId } = req.query;
    const transactions = await prisma.transaction.findMany({
      where: outletId ? { outletId: String(outletId) } : {},
      include: { items: true, user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(transactions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getDailyStats = async (req: Request, res: Response) => {
  try {
    const { outletId } = req.query;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = await prisma.transaction.aggregate({
      where: {
        outletId: String(outletId),
        createdAt: { gte: today },
        status: 'COMPLETED'
      },
      _sum: {
        total: true
      },
      _count: {
        id: true
      }
    });

    res.json({
      totalRevenue: stats._sum.total || 0,
      totalTransactions: stats._count.id || 0
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
