import { Router } from 'express';

// controller
import user_controller from '../../controllers/user_controllers';
const UserController = user_controller;

const router = Router();

router.post('/signup', UserController.createUser);

export default router;
