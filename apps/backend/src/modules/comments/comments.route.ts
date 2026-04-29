import { Router } from 'express';

import { postComment } from './comments.controller.js';

const router = Router();

router.post('/', postComment);

export default router;
