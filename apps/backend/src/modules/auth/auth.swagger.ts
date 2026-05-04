import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

import {
  AuthResponseSchema,
  AuthErrorResponseSchema,
  LoginBodySchema,
  SignupBodySchema,
} from './auth.dto.js';

export function registerAuthSwagger(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: 'post',
    path: '/auth/signup',
    tags: ['Auth'],
    summary: '회원가입',
    request: {
      body: { content: { 'application/json': { schema: SignupBodySchema } } },
    },
    responses: {
      201: {
        description: '회원가입 성공',
        content: { 'application/json': { schema: AuthResponseSchema } },
      },
      400: {
        description: '입력 값 오류 (validator.ts에서 걸러짐)',
        content: { 'application/json': { schema: AuthErrorResponseSchema } },
      },
      409: {
        description: '중복되는 이메일입니다. (AppError)',
        content: { 'application/json': { schema: AuthErrorResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/auth/login',
    tags: ['Auth'],
    summary: '로그인',
    request: {
      body: { content: { 'application/json': { schema: LoginBodySchema } } },
    },
    responses: {
      200: {
        description: '로그인 성공',
        content: { 'application/json': { schema: AuthResponseSchema } },
      },
      400: {
        description: '입력 값 오류 (이메일 형식 등)',
        content: { 'application/json': { schema: AuthErrorResponseSchema } },
      },
      401: {
        description: '이메일 또는 비밀번호 불일치 (AppError)',
        content: { 'application/json': { schema: AuthErrorResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/auth/logout',
    tags: ['Auth'],
    summary: '로그아웃',
    security: [{ bearerAuth: [] }],
    responses: {
      200: { description: '로그아웃 성공' },
      401: {
        description: '인증 필요',
        content: { 'application/json': { schema: AuthErrorResponseSchema } },
      },
    },
  });
}
