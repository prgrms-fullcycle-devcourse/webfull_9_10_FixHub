import type { Request, Response } from 'express';

import { getPublicIssuesQuerySchema } from './issues.dto.js';
import issuesService from './issues.service.js';

const issuesController = {
  async getPublicIssues(req: Request, res: Response) {
    const queryResult = getPublicIssuesQuerySchema.safeParse(req.query);

    if (!queryResult.success) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: '잘못된 쿼리 파라미터입니다.',
        },
      });
    }

    const result = await issuesService.getPublicIssues(queryResult.data);

    return res.status(200).json(result);
  },
};

export default issuesController;
