import { Request, Response, NextFunction } from 'express';

import ServerResponse from '../utils/response';

export default async (req: Request, res: Response, next: NextFunction) => {
	try {
		if (req.account !== 'admin')
			return new ServerResponse('You are not allowed into this route')
				.success(false)
				.statusCode(403)
				.respond(res);
		next();
	} catch (err) {
		next(err);
	}
};
