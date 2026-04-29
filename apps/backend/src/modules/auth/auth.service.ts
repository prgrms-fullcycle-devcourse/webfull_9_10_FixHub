import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import prisma from '../../common/config/prisma.js';
import type { SignupBody, LoginBody } from './auth.dto.js';
import { AppError } from '../../common/errors/AppError.js';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = '7d';

export const authService = {
  async signup(body: SignupBody) {
    const existing = await prisma.user.findUnique({
      where: { email: body.email },
    });
    if (existing) throw new AppError('CONFLICT', '중복되는 이메일입니다.', 409);

    const hashedPassword = await bcrypt.hash(body.password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
        provider: 'local',
      },
    });

    const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    return { user, accessToken };
  },

  async login(body: LoginBody) {
    const user = await prisma.user.findUnique({
      where: { email: body.email },
    });
    if (!user || !user.password)
      throw new AppError(
        'UNAUTHORIZED',
        '이메일 또는 비밀번호가 올바르지 않습니다.',
        401,
      );

    const isValid = await bcrypt.compare(body.password, user.password);
    if (!isValid)
      throw new AppError(
        'UNAUTHORIZED',
        '이메일 또는 비밀번호가 올바르지 않습니다.',
        401,
      );

    const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    return { user, accessToken };
  },
};
