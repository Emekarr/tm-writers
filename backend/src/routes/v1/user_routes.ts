import { Router } from 'express';

// controller
import user_controller from '../../controllers/user_controllers';
const { create_user, request_otp, verify_otp } = user_controller;

const router = Router();

router.post('/signup', create_user);

router.post('/request-otp', request_otp);

router.patch('/verify-otp', verify_otp);

export default router;
