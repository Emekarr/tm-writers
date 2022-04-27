import { Router } from 'express';

import auth_middleware from '../../middleware/authentication/auth_middleware';
import special_auth_middleware from '../../middleware/authentication/special_auth_middleware';

import user_routes from './user_routes';

import writer_routes from './writer_routes';

import order_routes from './order_routes';

import admin_route from './admin_routes';

import notif_routes from './notification_routes';

import request_route from './request_routes';

import comment_route from './comment_routes';

import project_routes from './project_routes';

const router = Router();

router.use('/user', user_routes);

router.use('/writer', writer_routes);

router.use('/project', auth_middleware, project_routes)

router.use('/order', auth_middleware, order_routes);

router.use('/admin', admin_route);

router.use('/notifications', auth_middleware, notif_routes);

router.use(
	'/request',
	auth_middleware,
	special_auth_middleware('admin', 'writer'),
	request_route,
);

router.use('/comment', auth_middleware, comment_route);

export default router;
