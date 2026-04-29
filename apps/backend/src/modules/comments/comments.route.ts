import { Router } from 'express';

import { postComment } from './comments.controller.js';

const router = Router();

router.post('/issues/:id/comments', postComment);

export default router;
