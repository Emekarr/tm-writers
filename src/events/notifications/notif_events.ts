import RedisRepository from '../../repository/redis/redis_repository';
import notification_repository from '../../repository/mongodb/notification_repository';

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
};
