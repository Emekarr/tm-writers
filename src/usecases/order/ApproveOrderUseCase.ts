import order_repository from '../../repository/mongodb/order_repository';
import { IOrderDocument } from '../../db/models/mongodb/order';
import notif_events from '../../events/notifications/notif_events';
import Emitter from '../../events/emitter';

export default abstract class ApproveOrderUseCase {
	private static order_repository = order_repository;

	static async execute(ids: string[]) {
		for (let i = 0; i < ids.length; i++) {
			const id = ids[i];
			const order = (await this.order_repository.findById(
				id,
			)) as IOrderDocument;
			if (!order) return 'order does not exist';
			if (order.state !== 'PENDING')
				return 'order is not in a pending state and cannot be approved';
			order.state = 'APPROVED';
			const result = await this.order_repository.saveData(order);
			if (!result) return 'something went wrong while updatig order';
			Emitter.emit(notif_events.ORDER_MESSAGE.EVENT);
		}
		return true;
	}
}
