import { Router } from 'express';

import NotificationController from '../../controllers/notification_controller';

const router = Router();

router.get('/fetch', NotificationController.fetchNotifications);

export default router;
