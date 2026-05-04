import { Router } from 'express';

import { authController } from './auth.controller.js';
import { validate } from '../../common/middlewares/validator.js';
import { authenticate } from '../../common/middlewares/authenticate.js';
import { SignupBodySchema, LoginBodySchema } from './auth.dto.js';

export const authRouter = Router();

authRouter.post('/signup', validate(SignupBodySchema), authController.signup);
authRouter.post('/login', validate(LoginBodySchema), authController.login);
authRouter.post('/logout', authenticate, authController.logout);
authRouter.get('/github/callback', authController.githubCallback);
