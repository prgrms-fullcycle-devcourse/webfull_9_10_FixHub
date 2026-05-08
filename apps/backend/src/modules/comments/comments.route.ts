import { Router } from 'express';

import { authenticate } from '../../common/middlewares/authenticate.js';
import {
  validate,
  validateParams,
} from '../../common/middlewares/validator.js';
import {
  deleteComment,
  getComments,
  patchComment,
  postAdoptComment,
  postComment,
} from './comments.controller.js';
import {
  AdoptCommentParamsSchema,
  CreateCommentBodySchema,
  CreateCommentParamsSchema,
  DeleteCommentParamsSchema,
  GetCommentsParamsSchema,
  UpdateCommentBodySchema,
  UpdateCommentParamsSchema,
} from './comments.dto.js';

const router = Router({ mergeParams: true });

router.get('/', validateParams(GetCommentsParamsSchema), getComments);

router.post(
  '/',
  authenticate,
  validateParams(CreateCommentParamsSchema),
  validate(CreateCommentBodySchema),
  postComment,
);
router.post(
  '/:commentId/adopt',
  authenticate,
  validateParams(AdoptCommentParamsSchema),
  postAdoptComment,
);

router.patch(
  '/:commentId',
  authenticate,
  validateParams(UpdateCommentParamsSchema),
  validate(UpdateCommentBodySchema),
  patchComment,
);

router.delete(
  '/:commentId',
  authenticate,
  validateParams(DeleteCommentParamsSchema),
  deleteComment,
);

export default router;
