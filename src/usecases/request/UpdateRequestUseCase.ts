import request_repository from '../../repository/mongodb/request_repository';
import { RequestDocument } from '../../db/models/mongodb/request';
import { Types } from 'mongoose';

export default abstract class UpdateRequestUseCase {
	private static request_repository = request_repository;

	static async execute(data: string[], id: string) {
		const request = (await this.request_repository.findById(
			id,
		)) as RequestDocument;
		if (!request) return `request does not exist`;
		if (request.accepted) return 'request already accepted';
		request.writers = data.map((writer) => {
			return {
				writer: new Types.ObjectId(writer),
				accepted: false,
				reason: undefined,
			};
		});
		await this.request_repository.saveData(request);
		return true;
	}
}
