import { Router } from 'express';

import WriterController from '../../controllers/writer_controller';

const router = Router();

router.post('/signup', WriterController.sign_up_writer);

router.put('/login', WriterController.login);

router.get('/profile', WriterController.getWriter);

export default router;
