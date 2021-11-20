import { Router } from 'express';

import user_routes from './user_routes';

const router = Router();

router.use('/user', user_routes);

export default router;
