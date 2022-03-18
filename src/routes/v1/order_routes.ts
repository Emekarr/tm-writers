import { Router } from 'express';

import special_auth_middleware from '../../middleware/authentication/special_auth_middleware';

import OrderController from '../../controllers/order_controller';

import FormDataParser from '../../services/FormDataParser';

const router = Router();

router.post(
	'/create',
	FormDataParser.uploadOne('attachment'),
	special_auth_middleware('user'),
	OrderController.createOrder,
);

router.put(
	'/approve',
	special_auth_middleware('admin'),
	OrderController.approveOrders,
);

router.put(
	'/reject',
	special_auth_middleware('admin'),
	OrderController.rejectOrders,
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

export default router;
