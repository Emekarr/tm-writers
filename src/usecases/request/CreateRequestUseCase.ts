import { validateCreateRequest } from '../../validators/request_validators';
import request_repository from '../../repository/mongodb/request_repository';
import { Request } from '../../db/models/mongodb/request';
import order_repository from '../../repository/mongodb/order_repository';

export default abstract class CreateRequestUseCase {
	private static validateCreateRequest = validateCreateRequest;

	private static request_repository = request_repository;

	private static order_repository = order_repository;

	static async execute(data: Request) {
		const request = this.validateCreateRequest(data);
		if (request.error)
			return `invalid data provided : ${request.error.message}`;
		const order = await this.order_repository.findById(request.value.order);
		if (!order) return 'this order does not exist any longer';
		return await this.request_repository.createEntry(request.value);
	}
}
