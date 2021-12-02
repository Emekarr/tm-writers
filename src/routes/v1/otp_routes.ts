import { Router } from 'express';

import otp_controller from '../../controllers/otp_controller';
const { request_otp, verify_otp } = otp_controller;

const router = Router();

router.post('/request-otp', request_otp);

router.patch('/verify-otp', verify_otp);

export default router;
