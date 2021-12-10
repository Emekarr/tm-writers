import { Router } from 'express';

import OtpController from '../../controllers/otp_controller';

const router = Router();

router.post('/verify-account', OtpController.requestOtp);

router.patch('/verify-email', OtpController.verifyEmail);

router.get('/reset-password-otp', OtpController.requestPasswordResetOtp);

router.post('/reset-password', OtpController.resetPassword);

export default router;
