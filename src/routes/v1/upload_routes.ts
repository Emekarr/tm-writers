import { Router } from 'express';

import auth_middleware from '../../middleware/authentication/auth_middleware';

import UploadController from '../../controllers/upload_controller';

const router = Router();

router.get('/fetch', auth_middleware, UploadController.fetchUpload);

export default router;
