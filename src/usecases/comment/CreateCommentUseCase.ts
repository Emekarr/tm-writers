import { Comment } from '../../db/models/mongodb/comment';
import comment_repository from '../../repository/mongodb/comment_repository';
import { validateCreateNewComment } from '../../validators/comment_validators';
import order_repository from '../../repository/mongodb/order_repository';
import { IOrderDocument } from '../../db/models/mongodb/order';

export default abstract class CreateCommentUseCase {
	private static comment_repository = comment_repository;

	private static validateCreateNewComment = validateCreateNewComment;

	private static order_repository = order_repository;

	static async execute(data: Comment, account: string) {
		if (account === 'user') {
			data.name = 'you';
		} else if (account === 'admin') {
			data.name = 'admin';
		} else {
			return 'you are not allowed to make a comment';
		}
		const comment = this.validateCreateNewComment(data);
		if (comment.error) return `invalid data provided ${comment.error.message}`;
		if (account === 'user') {
			const order = (await this.order_repository.findById(
				data.order.toString(),
			)) as IOrderDocument;
			if (!order) return 'order does not exist';
			if (order.createdBy.toString() !== comment.value.author)
				return 'you can only comment on orders created by you';
		}
		return await this.comment_repository.createEntry(comment.value);
	}
}
