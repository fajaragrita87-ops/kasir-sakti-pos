import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  password: z.string().min(6),
});

export const register = async (req: Request, res: Response) => {
  try {
    const { name, phone, password } = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (existingUser) {
      return res.status(400).json({ message: 'Nomor HP sudah terdaftar' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Create User & Outlet (Owner)
    const user = await prisma.user.create({
      data: {
        name,
        phone,
        password: hashedPassword,
        role: 'OWNER',
      },
    });

    // Generate simulated OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await prisma.otpVerification.create({
      data: {
        target: phone,
        code: otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 mins
      },
    });

    res.status(201).json({
      message: 'Registrasi berhasil. Silakan verifikasi OTP.',
      phone
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { phone, password } = req.body;
    const user = await prisma.user.findUnique({ where: { phone } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Nomor HP atau password salah' });
    }

    const token = jwt.sign(
      { userId: user.id, outletId: user.outletId, role: user.role },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { phone, code } = req.body;
    const verification = await prisma.otpVerification.findFirst({
      where: { target: phone, code, usedAt: null },
      orderBy: { createdAt: 'desc' }
    });

    if (!verification || verification.expiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP tidak valid atau kadaluarsa' });
    }

    await prisma.otpVerification.update({
      where: { id: verification.id },
      data: { usedAt: new Date() }
    });

    // Mark user as active or similar
    res.json({ message: 'Verifikasi berhasil' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
