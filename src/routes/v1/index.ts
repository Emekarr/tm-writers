import { Router } from 'express';

import auth_middleware from '../../middleware/authentication/auth_middleware';

import user_routes from './user_routes';

import writer_routes from './writer_routes';

import order_routes from './order_routes';

import admin_route from './admin_routes';

const router = Router();

router.use('/user', user_routes);

router.use('/writer', writer_routes);

router.use('/order', auth_middleware, order_routes);

router.use('/admin', admin_route);

export default router;
