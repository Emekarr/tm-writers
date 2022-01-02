import { Router } from 'express';

import WriterController from '../../controllers/writer_controller';

const router = Router();

router.post('/signup', WriterController.sign_up_writer);

router.put('/login', WriterController.login);

export default router;
