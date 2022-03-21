import { Router } from 'express';

import auth_middleware from '../../middleware/authentication/auth_middleware';
import special_auth_middleware from '../../middleware/authentication/special_auth_middleware';

import FormDataParser from '../../services/FormDataParser';

import WriterController from '../../controllers/writer_controller';

const router = Router();

router.post(
	'/signup',
	FormDataParser.uploadMultiple('media', 3),
	WriterController.createWriter,
);

router.post('/verify-account', WriterController.verifyAccount);

router.post('/login', WriterController.loginWriter);

router.get(
	'/profile',
	auth_middleware,
	special_auth_middleware('writer', 'admin', 'writer-unapproved'),
	WriterController.getWriter,
);

router.get(
	'/fetch',
	auth_middleware,
	special_auth_middleware('admin'),
	WriterController.getWriters,
);

export default router;
