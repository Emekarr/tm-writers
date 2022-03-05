import { Router } from 'express';

import special_auth_middleware from '../../middleware/authentication/special_auth_middleware';

import OrderController from '../../controllers/order_controller';

const router = Router();

router.post(
	'/create',
	special_auth_middleware('user', 'admin'),
	OrderController.createOrder,
);

router.get(
	'/user/all',
	special_auth_middleware('user'),
	OrderController.getOrders,
);

router.get(
	'/admin/all',
	special_auth_middleware('admin'),
	OrderController.getAllOrders,
);

router.delete(
	'/delete',
	special_auth_middleware('admin'),
	OrderController.deleteOrder,
);

router.put(
	'/assign',
	special_auth_middleware('admin'),
	OrderController.assignOrder,
);

router.get(
	'/pending',
	special_auth_middleware('user'),
	OrderController.pendingOrder,
);

export default router;
