import argon2 from 'argon2';
import * as jose from 'jose';
import { db } from '../../config/database';
import { env } from '../../config/env';
import { AppError } from '../../errors/appError';
import { RegisterInput, LoginInput } from './auth.schema';

export class AuthService {
  private static async signToken(userId: string, email: string) {
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    return await new jose.SignJWT({ email })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(userId)
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret);
  }

  static async register(input: RegisterInput) {
    const existing = await db.user.findUnique({ where: { email: input.email } });
    if (existing) throw new AppError('Email is already registered', 409);

    const hashedPassword = await argon2.hash(input.password);
    const user = await db.user.create({
      data: { email: input.email, password: hashedPassword, name: input.name },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    const token = await this.signToken(user.id, user.email);
    return { user, token };
  }

  static async login(input: LoginInput) {
    const user = await db.user.findUnique({ where: { email: input.email } });
    if (!user) throw new AppError('Invalid email or password', 401);

    const isValid = await argon2.verify(user.password, input.password);
    if (!isValid) throw new AppError('Invalid email or password', 401);

    const token = await this.signToken(user.id, user.email);
    return {
      user: { id: user.id, email: user.email, name: user.name },
      token,
    };
  }
}