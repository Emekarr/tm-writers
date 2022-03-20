import { Order, IOrderDocument } from '../../db/models/mongodb/order';
import { IUserDocument } from '../../db/models/mongodb/user';
import { validateCreateNewOrder } from '../../validators/orderValidators';
import order_repository from '../../repository/mongodb/order_repository';
import user_repository from '../../repository/mongodb/user_repository';
import generate_unique_id from '../../utils/generate_unique_id';

export default abstract class CreateNewOrderUseCase {
	private static repo = order_repository;

	private static validateCreateNewOrder = validateCreateNewOrder;

	private static user_repository = user_repository;

	static async execute(data: Order) {
		data.uniqueId = `sn-${generate_unique_id({
			useLetters: true,
			useNumbers: true,
			length: 14,
		})}`.toUpperCase();
		const order = this.validateCreateNewOrder(data);
		if (order.error) return `invalid data provided : ${order.error.message}`;
		const user = (await this.user_repository.findById(
			data.createdBy,
		)) as IUserDocument;
		if (!user) return `user with this id does not exist`;
		user.orders++;
		const last_order = (await this.repo.findLast({
			createdBy: order.value.createdBy,
		})) as IOrderDocument | null;
		if (!last_order) {
			order.value.orderNumber = 1;
		} else {
			last_order.orderNumber++;
			order.value.orderNumber = last_order.orderNumber;
		}
		await this.user_repository.saveData(user);
		return await this.repo.createEntry(order.value);
	}
}
