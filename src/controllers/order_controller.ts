import { Request, Response, NextFunction } from 'express';

import OrderRepository from '../db/mongodb/order_repository';

// services
import QueryService from '../services/query_service';
import CustomError from '../utils/error';
import ServerResponseBuilder from '../utils/response';

class OrderController {
	async createOrder(req: Request, res: Response, next: NextFunction) {
		try {
			const { services, message, timeline, number } = req.body;
			QueryService.checkIfNull([services, message, timeline, number]);
			const order = await OrderRepository.createEntry({
				services,
				message,
				timeline,
				number,
			});
			if (!order) throw new CustomError('Order failed to create', 400);
			new ServerResponseBuilder('Order creation successful')
				.data(order)
				.respond(res);
		} catch (err) {
			next(err);
		}
	}
}

export default Object.freeze(new OrderController());
