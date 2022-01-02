import { Router } from 'express';

import user_routes from './user_routes';

import writer_routes from './writer_routes';

import otp_routes from './otp_routes';

import order_routes from './order_routes';

const router = Router();

router.use('/user', user_routes);

router.use('/writer', writer_routes);

router.use('/otp', otp_routes);

router.use('/order', order_routes);

export default router;
