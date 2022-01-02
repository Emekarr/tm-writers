import { Router } from 'express';

import OrderController from '../../controllers/order_controller';

const router = Router();

router.post('/create', OrderController.createOrder);

router.get('/all', OrderController.getOrders);

router.delete('/delete', OrderController.deleteOrder);

router.put('/assign', OrderController.assignOrder);

export default router;
