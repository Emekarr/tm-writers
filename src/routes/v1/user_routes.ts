import { Router } from 'express';

// controller
import UserController from '../../controllers/user_controllers';

const router = Router();

router.post('/signup', UserController.createUser);

export default router;
