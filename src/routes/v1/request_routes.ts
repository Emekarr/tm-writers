import { Router } from 'express';

import RequestController from '../../controllers/request_controller';

const router = Router();

router.post('/create', RequestController.createRequest);

router.post('/accept', RequestController.acceptRequest);

router.post('/reject', RequestController.rejectRequest);

export default router;
