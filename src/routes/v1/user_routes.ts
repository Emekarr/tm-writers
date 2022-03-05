import { Router } from 'express';

import auth_middleware from '../../middleware/authentication/auth_middleware';
import special_auth_middleware from '../../middleware/authentication/special_auth_middleware';

// controller
import UserController from '../../controllers/user_controllers';

const router = Router();

router.post('/signup', UserController.createUser);

router.post('/verify-account', UserController.verifyAccount);

router.post('/login', UserController.loginUser);

router.get(
	'/profile',
	auth_middleware,
	special_auth_middleware('user'),
	UserController.getUser,
);

router.delete('/account/delete', UserController.deleteAccount);

export default router;
