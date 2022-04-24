import { Router } from 'express';

import RequestController from '../../controllers/request_controller';
import special_auth_middleware from '../../middleware/authentication/special_auth_middleware';

const router = Router();

router.post(
	'/create',
	special_auth_middleware('admin'),
	RequestController.createRequest,
);

router.post(
	'/accept',
	special_auth_middleware('writer'),
	RequestController.acceptRequest,
);

router.post(
	'/reject',
	special_auth_middleware('writer'),
	RequestController.rejectRequest,
);

export default router;
