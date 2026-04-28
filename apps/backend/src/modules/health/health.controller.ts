import { Request, Response } from 'express';

import { HealthCheckQuerySchema } from './health.dto.js';
import { checkDatabase } from './health.service.js';

export async function healthCheck(req: Request, res: Response) {
  const parsed = HealthCheckQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: parsed.error.flatten(),
    });
  }

  const db = await checkDatabase();

  res.json({
    message: 'server running!',
    success: true,
    echo: parsed.data.input ?? null,
    db,
  });
} // respone 스키마 어디감?
