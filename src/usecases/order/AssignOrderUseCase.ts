import { validateUpdateOrder } from '../../validators/orderValidators';
import order_repository from '../../repository/mongodb/order_repository';
import { Types } from 'mongoose';

export default abstract class AssignOrderUseCase {
	private static validateUpdateOrder = validateUpdateOrder;

	private static repo = order_repository;

	static async execute(data: { assignedTo: string }, orderId: string) {
		const order = this.validateUpdateOrder({
			assignedTo: new Types.ObjectId(data.assignedTo),
		});
		if (order.error) return `invalid json passed : ${order.error.message}`;
		return await this.repo.updateById(orderId, order.value);
	}
}
