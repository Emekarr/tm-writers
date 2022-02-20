import { Router } from 'express';

import user_admin_auth_middleware from '../../middleware/authentication/user_admin_auth_middleware';
import admin_auth_middleware from '../../middleware/authentication/admin_auth_middleware';

import OrderController from '../../controllers/order_controller';

const router = Router();

router.post('/create', user_admin_auth_middleware, OrderController.createOrder);

router.get('/user/all', user_admin_auth_middleware, OrderController.getOrders);

router.get('/admin/all', admin_auth_middleware, OrderController.getAllOrders);

router.delete('/delete', admin_auth_middleware, OrderController.deleteOrder);

router.put('/assign', admin_auth_middleware, OrderController.assignOrder);

export default router;
