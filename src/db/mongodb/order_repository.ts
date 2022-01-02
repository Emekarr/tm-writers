import OrderModel from '../models/order';

import MongoDbRepository from './mongodb_repository';

class OrderRepository extends MongoDbRepository {
	constructor() {
		super(OrderModel);
	}
}

export default new OrderRepository();
