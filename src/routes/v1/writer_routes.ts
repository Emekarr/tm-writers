import { Router } from 'express';

import writer_controller from '../../controllers/writer_controller';
const { sign_up_writer } = writer_controller;

const router = Router();

router.post('/signup', sign_up_writer);

export default router;
