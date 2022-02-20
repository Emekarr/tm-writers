import { Order, IOrderDocument } from '../../db/models/mongodb/order';
import { validateCreateNewOrder } from '../../validators/orderValidators';
import order_repository from '../../repository/mongodb/order_repository';
import generate_unique_id from '../../utils/generate_unique_id';

export default abstract class CreateNewOrderUseCase {
	private static repo = order_repository;

	private static validateCreateNewOrder = validateCreateNewOrder;

	static async execute(data: Order) {
		data.uniqueId = `sn-${generate_unique_id({
			useLetters: true,
			useNumbers: true,
			length: 14,
		})}`;
		const order = this.validateCreateNewOrder(data);
		if (order.error) return `invalid data provided : ${order.error.message}`;
		const last_order = (await this.repo.findLast({
			createdBy: order.value.createdBy,
		})) as IOrderDocument | null;
		if (!last_order) {
			order.value.orderNumber = 1;
		} else {
			last_order.orderNumber++;
			order.value.orderNumber = last_order.orderNumber;
		}
		return await this.repo.createEntry(order.value);
	}
}
