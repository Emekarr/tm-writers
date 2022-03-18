import RedisRepository from '../../repository/redis/redis_repository';
import notification_repository from '../../repository/mongodb/notification_repository';
import { NotificationDocument } from '../../db/models/mongodb/notification';

export default {
	USER_CREATED: {
		EVENT: 'USER_CREATED',
		ACTION: async (...args: any[]) => {
			await notification_repository.createEntry(args[0]);
		},
	},
	ADMIN_MESSAGE: {
		EVENT: 'ADMIN_MESSAGE',
		ACTION: async (...args: any[]) => {
			await notification_repository.createEntry(args[0]);
		},
	},
	ORDER_MESSAGE: {
		EVENT: 'ORDER_APPROVED',
		ACTION: async (...args: any[]) => {
			await notification_repository.createEntry(args[0]);
		},
	},
};
