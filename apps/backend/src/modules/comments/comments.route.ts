import { Router } from 'express';

import { authenticate } from '../../common/middlewares/authenticate.js';
import { postComment } from './comments.controller.js';

const router = Router();

router.post('/:id/comments', authenticate, postComment);

export default router;
