import { Request, Response, NextFunction } from 'express';

// utils
import validate_body from '../utils/validate_body';
import ServerResponse from '../utils/response';

// usecases
import CreateRequestUseCase from '../usecases/request/CreateRequestUseCase';

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
}
