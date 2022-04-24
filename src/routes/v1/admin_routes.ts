import { Router } from 'express';

import special_auth_middleware from '../../middleware/authentication/special_auth_middleware';

import AdminController from '../../controllers/admin_controller';

const router = Router();

router.post('/login', AdminController.login);

router.post(
	'/create',
	special_auth_middleware('admin'),
	AdminController.createNewAdmin,
);

export default router;
