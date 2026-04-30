import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const SignupBodySchema = z.object({
  name: z.string().min(2).openapi({ example: '홍길동' }),
  email: z.string().email().openapi({ example: 'user@example.com' }),
  password: z.string().min(8).openapi({ example: 'password123' }),
});

export const LoginBodySchema = z.object({
  email: z.string().email().openapi({ example: 'user@example.com' }),
  password: z.string().openapi({ example: 'password123' }),
});

export const UserResponseSchema = z.object({
  id: z.string().uuid().openapi({ example: 'uuid-1234-5678' }),
  name: z.string().openapi({ example: '홍길동' }),
});

export const AuthResponseSchema = z.object({
  message: z.string().openapi({ example: '로그인 성공' }),
  user: UserResponseSchema,
});

export const AuthErrorResponseSchema = z.object({
  error: z.object({
    code: z.string().openapi({
      description: '에러 코드 (CONFLICT, UNAUTHORIZED, BAD_REQUEST 등)',
    }),
    message: z.string().openapi({
      description: '에러 상세 메시지',
    }),
  }),
});

export type SignupBody = z.infer<typeof SignupBodySchema>;
export type LoginBody = z.infer<typeof LoginBodySchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type AuthErrorResponse = z.infer<typeof AuthErrorResponseSchema>;
