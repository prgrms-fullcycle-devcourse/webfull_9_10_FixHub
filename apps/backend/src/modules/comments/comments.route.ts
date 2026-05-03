import { Router } from 'express';

import { authenticate } from '../../common/middlewares/authenticate.js';
import { validate } from '../../common/middlewares/validator.js';
import {
  getComments,
  postAdoptComment,
  postComment,
} from './comments.controller.js';
import { CreateCommentBodySchema } from './comments.dto.js';

const router = Router();

router.get('/:id/comments', getComments);

router.post('/:id/comments/:commentId/adopt', authenticate, postAdoptComment);

router.post(
  '/:id/comments',
  authenticate,
  validate(CreateCommentBodySchema),
  postComment,
);

export default router;
