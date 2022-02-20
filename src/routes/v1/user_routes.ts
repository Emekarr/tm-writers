import { Router } from 'express';

import auth_middleware from '../../middleware/authentication/auth_middleware';
import user_auth_middleware from '../../middleware/authentication/user_auth_middleware';

// controller
import UserController from '../../controllers/user_controllers';

const router = Router();

router.post('/signup', UserController.createUser);

router.post('/verify-account', UserController.verifyAccount);

router.post('/login', UserController.loginUser);

router.get(
	'/profile',
	auth_middleware,
	user_auth_middleware,
	UserController.getUser,
);

export default router;
