import { Router } from 'express';

import auth_middleware from '../../middleware/authentication/auth_middleware';
import writer_auth_middleware from '../../middleware/authentication/writer_auth_middleware';

import WriterController from '../../controllers/writer_controller';

const router = Router();

router.post('/signup', WriterController.createWriter);

router.post('/verify-account', WriterController.verifyAccount);

router.put('/login', WriterController.loginWriter);

router.get(
	'/profile',
	auth_middleware,
	writer_auth_middleware,
	WriterController.getWriter,
);

export default router;
