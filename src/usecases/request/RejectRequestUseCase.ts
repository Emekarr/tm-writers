import request_repository from '../../repository/mongodb/request_repository';
import { Request, RequestDocument } from '../../db/models/mongodb/request';
import order_repository from '../../repository/mongodb/order_repository';
import user from '../../db/models/mongodb/user';
import { Types } from 'mongoose';
import { IOrderDocument } from '../../db/models/mongodb/order';

export default abstract class RejectRequestUseCase {
	private static request_repository = request_repository;

	private static order_repository = order_repository;

	static async execute(data: {
		requestId: string;
		reason: string;
		user: string;
	}) {
		const order = (await this.order_repository.findById(
			data.orderId,
		)) as IOrderDocument;
		if (!order) return `order does not exist`;
		const request = (await this.request_repository.findById(
			data.requestId,
		)) as RequestDocument;
		if (!request) return `request does not exist`;
		const exists = request.writers.filter((writer) => {
			writer.writer.toString() === data.user;
		});
		if (!exists.length)
			return `You are not amongst the writers assinged to this request`;
		if (exists[0].accepted === false)
			return `This request has already been rejected by you`;
		if (exists[0].accepted === true)
			return `This request has already been accepted by you`;

		for (let i = 0; i < request.writers.length; i++) {
			const writer = request.writers[i];
			if (writer.writer.toString() === data.user) {
				request.writers[i] = {
					writer: writer.writer,
					accepted: false,
					reason: data.reason,
				};
				break;
			}
		}
		await this.request_repository.saveData(request);
		return true;
	}
}
