import { Router } from 'express';

import special_auth_middleware from '../../middleware/authentication/special_auth_middleware';

import NotificationController from '../../controllers/notification_controller';

const router = Router();

router.get(
	'/fetch',
	special_auth_middleware('user', 'admin', 'writer'),
	NotificationController.fetchNotifications,
);

export default router;
