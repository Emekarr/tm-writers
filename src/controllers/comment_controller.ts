import { Request, Response, NextFunction } from 'express';

// use cases
import CreateCommentUseCase from '../usecases/comment/CreateCommentUseCase';

// utils
import validate_body from '../utils/validate_body';
import ServerResponse from '../utils/response';

// repository
import comment_repository from '../repository/mongodb/comment_repository';

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

	static async getComments(req: Request, res: Response, next: NextFunction) {
		try {
			const { order, page, limit } = req.query;
			const invalid = validate_body([order]);
			if (invalid)
				return new ServerResponse(
					invalid ||
						'please pass in the appropraite data needed to create a comment',
				)
					.statusCode(400)
					.success(false)
					.respond(res);
			const comments = await comment_repository.findManyByFields(
				{ order },
				{
					limit: Number(limit),
					page: Number(page),
				},
			);
			new ServerResponse('Comments retrieved').data(comments).respond(res);
		} catch (err) {
			next(err);
		}
	}
}
