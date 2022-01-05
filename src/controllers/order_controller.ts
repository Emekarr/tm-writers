import { v4 } from 'uuid';
import { isValidObjectId } from 'mongoose';

import { Request, Response, NextFunction } from 'express';
import { IOrderDocument } from '../db/models/order';

import OrderRepository from '../db/mongodb/order_repository';

// services
import QueryService from '../services/query_service';
import CustomError from '../utils/error';
import ServerResponseBuilder from '../utils/response';

class OrderController {
	async createOrder(req: Request, res: Response, next: NextFunction) {
		try {
			const { services, message, timeline, number, name } = req.body;
			QueryService.checkIfNull([services, message, timeline, name, number]);
			const orderNumber = (await OrderRepository.findLast())
				? ((await OrderRepository.findLast()) as IOrderDocument).orderNumber + 1
				: 1;
			const order = await OrderRepository.createEntry({
				services,
				message,
				timeline,
				number,
				orderNumber,
				uniqueId: v4(),
				name,
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
			if (!isValidObjectId(id as string))
				throw new CustomError('Please pass in a valid objectId', 400);
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
