import { Router } from 'express';

import AdminController from '../../controllers/admin_controller';

const router = Router();

router.post('/login', AdminController.login);

export default router;
