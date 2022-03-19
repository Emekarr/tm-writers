import { Router } from 'express';

import auth_middleware from '../../middleware/authentication/auth_middleware';

import user_routes from './user_routes';

import writer_routes from './writer_routes';

import order_routes from './order_routes';

import admin_route from './admin_routes';

import notif_routes from './notification_routes';

import request_route from './request_routes';

const router = Router();

router.use('/user', user_routes);

router.use('/writer', writer_routes);

router.use('/order', auth_middleware, order_routes);

router.use('/admin', admin_route);

router.use('/notifications', auth_middleware, notif_routes);

router.use('/request', request_route);

export default router;
