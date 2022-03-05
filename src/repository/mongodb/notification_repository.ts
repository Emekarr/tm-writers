import NotificationModel from '../../db/models/mongodb/notification';

import MongoDbRepository from './mongodb_repository';

class NotificationRepository extends MongoDbRepository {
	constructor() {
		super(NotificationModel);
	}
}

export default new NotificationRepository();
