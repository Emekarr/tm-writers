import { Router } from 'express';

import AdminController from '../../controllers/admin_controller';

const router = Router();

router.put('/login', AdminController.login);

export default router;
