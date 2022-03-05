import { Request, Response, NextFunction } from 'express';

import ServerResponse from '../../utils/response';

export default (...args: string[]) =>
	(req: Request, res: Response, next: NextFunction) => {
		try {
			if (args.includes(req.account)) return next();
			new ServerResponse('You are not allowed into this route')
				.success(false)
				.statusCode(403)
				.respond(res);
		} catch (err) {
			next(err);
		}
	};
