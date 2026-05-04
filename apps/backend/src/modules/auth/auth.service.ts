import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import axios from 'axios';

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

    return { user: { id: user.id, name: user.name }, accessToken };
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

    return {
      user: { id: user.id, name: user.name },
      accessToken,
    };
  },

  async githubLogin(code: string) {
    // 1. GitHub Access Token 요청
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: 'application/json' } },
    );

    const accessToken = tokenResponse.data.access_token;

    // 2. GitHub 유저 정보 요청
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const { id, login, avatar_url: profileImg, email } = userResponse.data;

    // 3. DB 저장 시 변경된 변수명 사용
    let user = await prisma.user.findFirst({
      where: { provider: 'github', providerId: String(id) },
    });

    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = await prisma.user.create({
        data: {
          email: email || `${login}@github.com`,
          name: login,
          profileImg: profileImg,
          provider: 'github',
          providerId: String(id),
        },
      });
    }
    const serviceToken = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    return {
      user: { id: user.id, name: user.name },
      accessToken: serviceToken,
      isNewUser,
    };
  },
};
