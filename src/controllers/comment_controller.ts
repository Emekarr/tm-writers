import { Request, Response, NextFunction } from 'express';

// use cases
import CreateCommentUseCase from '../usecases/comment/CreateCommentUseCase';
import ServerResponseBuilder from '../utils/response';

// utils
import validate_body from '../utils/validate_body';
import ServerResponse from '../utils/response';

export default abstract class CommentController {
	static async createComment(req: Request, res: Response, next: NextFunction) {
		try {
			const data = req.body;
			const invalid = validate_body(Object.values(data));
			if (invalid)
				return new ServerResponse(
					invalid ||
						'please pass in the appropraite data needed to create a comment',
				)
					.statusCode(400)
					.success(false)
					.respond(res);
			const comment = await CreateCommentUseCase.execute(
				data,
				req.account,
				req.id,
			);
			if (typeof comment === 'string' || !comment)
				return new ServerResponse(
					comment || 'something went wrong while creating a comment',
				)
					.success(false)
					.statusCode(400)
					.respond(res);
			new ServerResponse('Comment saved').data(comment).respond(res);
		} catch (err) {
			next(err);
		}
	}
}
