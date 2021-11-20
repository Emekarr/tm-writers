import { Router } from 'express';

// controller
import user_controller from '../../controllers/user_controllers';
const { create_user } = user_controller;

const router = Router();

router.post('/signup', create_user);

export default router;
