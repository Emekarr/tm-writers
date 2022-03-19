import { Router } from 'express';

import RequestController from '../../controllers/request_controller';

const router = Router();

router.post('/create', RequestController.createRequest);

export default router;
