import { Router } from 'express';

import OrderController from '../../controllers/order_controller';

const router = Router();

router.post('/create', OrderController.createOrder);

router.get('/all', OrderController.getOrders);

export default router;
