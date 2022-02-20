import { Request, Response, NextFunction } from 'express';

import OrderRepository from '../repository/mongodb/order_repository';

// usecases
import CreateNewOrderUseCase from '../usecases/order/CreateNewOrderUseCase';
import DeleteOrderUseCase from '../usecases/order/DeleteOrderUseCase';
import AssignOrderUseCase from '../usecases/order/AssignOrderUseCase';

// utils
import ServerResponse from '../utils/response';
import validate_body from '../utils/validate_body';

export default abstract class OrderController {
	static async createOrder(req: Request, res: Response, next: NextFunction) {
		try {
			const orderData = req.body;
			orderData.createdBy = req.id;
			const order = await CreateNewOrderUseCase.execute(orderData);
			if (!order || typeof order === 'string')
				return new ServerResponse(order || 'Order creation faied')
					.statusCode(400)
					.success(false)
					.respond(res);
			new ServerResponse('Order creation successful').data(order).respond(res);
		} catch (err) {
			next(err);
		}
	}

	static async getOrders(req: Request, res: Response, next: NextFunction) {
		try {
			const { limit, page } = req.query;
			const orders = await OrderRepository.findManyByFields(
				{ createdBy: req.id },
				{ limit: Number(limit), page: Number(page) },
				['assignedTo'],
			);
			new ServerResponse('Order retrieved successfully')
				.data(orders)
				.respond(res);
		} catch (err) {
			next(err);
		}
	}

	static async getAllOrders(req: Request, res: Response, next: NextFunction) {
		try {
			const { limit, page } = req.query;
			const orders = await OrderRepository.findAll(
				{ limit: Number(limit), page: Number(page) },
				['assignedTo'],
			);
			new ServerResponse('Order retrieved successfully')
				.data(orders)
				.respond(res);
		} catch (err) {
			next(err);
		}
	}

	static async deleteOrder(req: Request, res: Response, next: NextFunction) {
		try {
			const ids = req.body;
			const invalid = validate_body(ids);
			if (invalid)
				return new ServerResponse(invalid || 'please pass in an order id')
					.statusCode(400)
					.success(false)
					.respond(res);
			const deleted = await DeleteOrderUseCase.execute(ids);
			if (!deleted || typeof deleted == 'string')
				return new ServerResponse(deleted || 'please pass in an order id')
					.statusCode(400)
					.success(false)
					.respond(res);
			new ServerResponse('Order deleted successfully').respond(res);
		} catch (err) {
			next(err);
		}
	}

	static async assignOrder(req: Request, res: Response, next: NextFunction) {
		try {
			const { orderId, writerId } = req.body;
			const invalid = validate_body([orderId, writerId]);
			if (invalid)
				return new ServerResponse(
					invalid || 'please pass in an order and writer id',
				)
					.statusCode(400)
					.success(false)
					.respond(res);
			const assigned = await AssignOrderUseCase.execute(
				{
					assignedTo: writerId,
				},
				orderId,
			);
			if (!assigned || typeof assigned === 'string')
				return new ServerResponse(
					assigned || 'something went wrong while assigning writer',
				)
					.statusCode(400)
					.success(false)
					.respond(res);
			new ServerResponse('Order successfully assigned').respond(res);
		} catch (err) {
			next(err);
		}
	}
}
