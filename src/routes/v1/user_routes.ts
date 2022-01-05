import { Router } from 'express';

// controller
import UserController from '../../controllers/user_controllers';

const router = Router();

router.post('/signup', UserController.createUser);

router.post('/login', UserController.login);

router.get('/profile')

export default router;
