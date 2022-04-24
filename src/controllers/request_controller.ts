import { Request, Response, NextFunction } from 'express';

// utils
import validate_body from '../utils/validate_body';
import ServerResponse from '../utils/response';

// usecases
import CreateRequestUseCase from '../usecases/request/CreateRequestUseCase';
import RejectRequestUseCase from '../usecases/request/RejectRequestUseCase';
import AcceptRequestUseCase from '../usecases/request/AcceptRequestUseCase';

import request_repository from '../repository/mongodb/request_repository';

export default abstract class RequestController {
	static async createRequest(req: Request, res: Response, next: NextFunction) {
		try {
			const data = req.body;
			const invalid = validate_body([data]);
			if (invalid)
				return new ServerResponse(
					'Please pass in the data required to create a request',
				)
					.statusCode(400)
					.success(false)
					.respond(res);
			const result = await CreateRequestUseCase.execute(data);
			if (typeof result === 'string' || !result)
				return new ServerResponse(
					result || 'something went wrong while creating a request',
				)
					.success(false)
					.statusCode(400)
					.respond(res);
			new ServerResponse('Request made').statusCode(201).respond(res);
		} catch (err) {
			next(err);
		}
	}

	static async rejectRequest(req: Request, res: Response, next: NextFunction) {
		try {
			const { requestId, orderId, reason } = req.body;
			const user = req.id;
			const response = await RejectRequestUseCase.execute({
				orderId,
				requestId,
				reason,
				user,
			});
			if (typeof response === 'string' || !response) {
				return new ServerResponse(
					response ||
						'Something went wrong while rejecting your request. Contact the admin or try again later',
				)
					.success(false)
					.statusCode(400)
					.respond(res);
			}
			new ServerResponse('Request rejected successfully').respond(res);
		} catch (err) {
			next(err);
		}
	}

	static async acceptRequest(req: Request, res: Response, next: NextFunction) {
		try {
			const { requestId, orderId } = req.body;
			const user = req.id;
			const response = await AcceptRequestUseCase.execute({
				orderId,
				requestId,
				user,
			});
			if (typeof response === 'string' || !response) {
				return new ServerResponse(
					response ||
						'Something went wrong while rejecting your request. Contact the admin or try again later',
				)
					.success(false)
					.statusCode(400)
					.respond(res);
			}
			new ServerResponse('Request accepted successfully').respond(res);
		} catch (err) {
			next(err);
		}
	}

	static async getWriterRequests(
		req: Request,
		res: Response,
		next: NextFunction,
	) {
		try {
			const { limit, page, accepted } = req.query;
			const requests = await request_repository.findManyByFields(
				{
					'writers.writer': req.id,
					'writer.accepted': accepted,
				},
				{
					limit: Number(limit),
					page: Number(page),
				},
			);
			new ServerResponse('Requests fetched succesfully')
				.data(requests)
				.respond(res);
		} catch (err) {
			next(err);
		}
	}

	static async getWriterRequestsAdmin(
		req: Request,
		res: Response,
		next: NextFunction,
	) {
		try {
			const { limit, page } = req.query;
			const requests = await request_repository.findAll({
				limit: Number(limit),
				page: Number(page),
			});
			new ServerResponse('Requests fetched succesfully')
				.data(requests)
				.respond(res);
		} catch (err) {
			next(err);
		}
	}
}
