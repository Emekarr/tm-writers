import { Response, Request, NextFunction } from 'express';

// utils
import ServerResponse from '../utils/response';

// repository
import notification_repository from '../repository/mongodb/notification_repository';

export default abstract class NotificationController {
	static async fetchNotifications(
		req: Request,
		res: Response,
		next: NextFunction,
	) {
		try {
			const notifications = await notification_repository.findManyByFields({
				reciever: req.id,
			});
			new ServerResponse('Notifications fetched')
				.data(notifications)
				.respond(res);
		} catch (err) {
			next(err);
		}
	}
}
