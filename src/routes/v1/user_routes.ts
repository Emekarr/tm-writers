import { Router } from 'express';

import auth_middleware from '../../middleware/authentication/auth_middleware';
import special_auth_middleware from '../../middleware/authentication/special_auth_middleware';

// controller
import UserController from '../../controllers/user_controllers';

// services
import FormDataParser from '../../services/FormDataParser';

const router = Router();

router.post('/signup', UserController.createUser);

router.post('/verify-account', UserController.verifyAccount);

router.post('/login', UserController.loginUser);

router.put(
	'/profile/update',
	auth_middleware,
	special_auth_middleware('user'),
	FormDataParser.uploadOne('profile_image'),
	UserController.updateUser,
);

router.put(
	'/account/update-password',
	auth_middleware,
	special_auth_middleware('user'),
	UserController.updateUserPassword,
);

router.get(
	'/profile',
	auth_middleware,
	special_auth_middleware('user', 'admin'),
	UserController.getUser,
);

router.post('/contact/help-me', UserController.sendContactEmail);

router.delete('/account/delete', auth_middleware, UserController.deleteAccount);

export default router;
