import { Request, Response, NextFunction } from 'express';

import OrderRepository from '../repository/mongodb/order_repository';

// usecases
import CreateNewOrderUseCase from '../usecases/order/CreateNewOrderUseCase';
import DeleteOrderUseCase from '../usecases/order/DeleteOrderUseCase';
import AssignOrderUseCase from '../usecases/order/AssignOrderUseCase';
import ApproveOrderUseCase from '../usecases/order/ApproveOrderUseCase';
import RejectOrderUseCase from '../usecases/order/RejectOrderUseCase';

// utils
import ServerResponse from '../utils/response';
import validate_body from '../utils/validate_body';

// services
import MediaService from '../services/MediaService';

// models
import { IUserDocument } from '../db/models/mongodb/user';

// user repository
import user_repository from '../repository/mongodb/user_repository';
import order_repository from '../repository/mongodb/order_repository';

export default abstract class OrderController {
	static async createOrder(req: Request, res: Response, next: NextFunction) {
		try {
			const orderData = req.body;
			orderData.attachment = req.file?.buffer;
			// if (req.file) {
			// 	orderData.attachment = await MediaService.uploadDataStream(
			// 		req.file.buffer,
			// 		'order-attachments',
			// 		req.file.originalname,
			// 	);
			// }
			orderData.createdBy = req.id;
			// orderData.services = JSON.parse(orderData.services);
			const order = await CreateNewOrderUseCase.execute(orderData);
			if (req.account === 'user') {
				const user = (await user_repository.findById(req.id)) as IUserDocument;
				user.orders++;
				await user_repository.saveData(user);
			}
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

	static async approveOrders(req: Request, res: Response, next: NextFunction) {
		try {
			const { ids } = req.body;
			const invalid = validate_body(ids);
			if (invalid)
				return new ServerResponse(
					invalid || 'please pass in an array of id to be approved',
				)
					.statusCode(400)
					.success(false)
					.respond(res);
			const result = await ApproveOrderUseCase.execute(ids as string[]);
			if (!result || typeof result === 'string')
				return new ServerResponse(result || 'could not approve order')
					.success(false)
					.statusCode(400)
					.respond(res);
			new ServerResponse('Orders approved').respond(res);
		} catch (err) {
			next(err);
		}
	}

	static async rejectOrders(req: Request, res: Response, next: NextFunction) {
		try {
			const { ids } = req.body;
			const invalid = validate_body(ids);
			if (invalid)
				return new ServerResponse(
					invalid || 'please pass in an array of id to be rejected',
				)
					.statusCode(400)
					.success(false)
					.respond(res);
			const result = await RejectOrderUseCase.execute(ids as string[]);
			if (!result || typeof result === 'string')
				return new ServerResponse(result || 'could not reject order')
					.success(false)
					.statusCode(400)
					.respond(res);
			new ServerResponse('Orders rejected').respond(res);
		} catch (err) {
			next(err);
		}
	}

	static async getOrders(req: Request, res: Response, next: NextFunction) {
		try {
			const { limit, page, state, id } = req.query;
			let orders;
			if (req.account === 'admin') {
				orders = await OrderRepository.findManyByFields(
					{ createdBy: id, state },
					{ limit: Number(limit), page: Number(page) },
				);
			} else {
				orders = await OrderRepository.findManyByFields(
					{ createdBy: req.id, state },
					{ limit: Number(limit), page: Number(page) },
				);
			}
			new ServerResponse('Order retrieved successfully')
				.data(orders)
				.respond(res);
		} catch (err) {
			next(err);
		}
	}

	static async getAllOrders(req: Request, res: Response, next: NextFunction) {
		try {
			const { limit, page, state, sort } = req.query;
			const orders = await OrderRepository.findManyByFields(
				{ state },
				{
					limit: Number(limit),
					page: Number(page),
				},
				[],
				Number(sort),
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

	static async getOneOrder(req: Request, res: Response, next: NextFunction) {
		try {
			const { id } = req.query;
			const order = await order_repository.findById(id as string);
			if (!order)
				return new ServerResponse('Order does not exist')
					.success(false)
					.statusCode(404)
					.respond(res);
			new ServerResponse('Order successfully retrieved')
				.data(order)
				.respond(res);
		} catch (err) {
			next(err);
		}
	}
}
