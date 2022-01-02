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

	async getOrders(req: Request, res: Response, next: NextFunction) {
		try {
			const { limit, page } = req.query;
			const orders = await OrderRepository.findAll(
				{ limit: Number(limit), page: Number(page) },
				['assignedTo'],
			);
			new ServerResponseBuilder('Order retrieved successfully')
				.data(orders)
				.respond(res);
		} catch (err) {
			next(err);
		}
	}

	async deleteOrder(req: Request, res: Response, next: NextFunction) {
		try {
			const { id } = req.query;
			QueryService.checkIfNull([id]);
			const deleted = await OrderRepository.deleteById(id as string);
			if (!deleted) throw new CustomError('Failed to delete order', 400);
			new ServerResponseBuilder('Order deleted successfully').respond(res);
		} catch (err) {
			next(err);
		}
	}

	async assignOrder(req: Request, res: Response, next: NextFunction) {
		try {
			const { orderId, writerId } = req.body;
			QueryService.checkIfNull([orderId, writerId]);
			const assigned = await OrderRepository.updateById(orderId, {
				assignedTo: writerId,
			});
			if (!assigned)
				throw new CustomError('Failed to assign order to writer', 400);
			new ServerResponseBuilder('Order successfully assigned').respond(res);
		} catch (err) {
			next(err);
		}
	}
}

export default Object.freeze(new OrderController());
