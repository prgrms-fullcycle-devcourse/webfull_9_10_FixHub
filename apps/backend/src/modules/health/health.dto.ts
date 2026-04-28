import { z } from 'zod';

export const HealthCheckQuerySchema = z.object({
  input: z.string().min(1).optional(),
});

export const HealthCheckResponseSchema = z.object({
  message: z.string(),
  success: z.boolean(),
  echo: z.string().nullable(),
  db: z.boolean(),
});

export type HealthCheckQueryDto = z.infer<typeof HealthCheckQuerySchema>;
