import { Router } from 'express';

import RequestController from '../../controllers/request_controller';
import special_auth_middleware from '../../middleware/authentication/special_auth_middleware';

const router = Router();

router.post(
	'/create',
	special_auth_middleware('admin'),
	RequestController.createRequest,
);

router.put(
	'/accept',
	special_auth_middleware('writer'),
	RequestController.acceptRequest,
);

router.put(
	'/reject',
	special_auth_middleware('writer'),
	RequestController.rejectRequest,
);

router.put(
	'/update',
	special_auth_middleware('admin'),
	RequestController.updateWritersInRequest,
);

router.get('/all-requests', RequestController.getWriterRequests);

router.get(
	'/all-requests-admin',
	special_auth_middleware('admin'),
	RequestController.getWriterRequestsAdmin,
);

router.get(
	'/get-request',
	special_auth_middleware('admin', 'writer'),
	RequestController.getOneRequest,
);

export default router;
