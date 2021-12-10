import { Router } from 'express';

import OtpController from '../../controllers/otp_controller';

const router = Router();

router.post('/request-otp', OtpController.requestOtp);

router.patch('/verify-otp', OtpController.verifyEmail);

export default router;
