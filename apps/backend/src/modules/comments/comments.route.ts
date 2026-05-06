import { Router } from 'express';

import { authenticate } from '../../common/middlewares/authenticate.js';
import { validate } from '../../common/middlewares/validator.js';
import {
  deleteComment,
  getComments,
  patchComment,
  postAdoptComment,
  postComment,
} from './comments.controller.js';
import {
  CreateCommentBodySchema,
  UpdateCommentBodySchema,
} from './comments.dto.js';

const router = Router({ mergeParams: true });

router.get('/', getComments);

router.post('/', authenticate, validate(CreateCommentBodySchema), postComment);
router.post('/:commentId/adopt', authenticate, postAdoptComment);

router.patch(
  '/:commentId',
  authenticate,
  validate(UpdateCommentBodySchema),
  patchComment,
);

router.delete('/:commentId', authenticate, deleteComment);

export default router;
