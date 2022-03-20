import comment_repository from '../../repository/mongodb/comment_repository';
import { CommentDocument } from '../../db/models/mongodb/comment';

export default abstract class DeleteCommentUseCase {
	private static comment_repository = comment_repository;

	static async execute(commentId: string, user: string) {
		const comment = (await this.comment_repository.findById(
			commentId,
		)) as CommentDocument;
		if (!comment) return 'comment does not exist';
		if (comment.author.toString() !== user)
			return 'you are not allowed to delete this comment';
		return this.comment_repository.deleteById(commentId);
	}
}
