import { Router } from 'express';

import CommentController from '../../controllers/comment_controller';

const router = Router();

router.post('/create', CommentController.createComment);

router.get('/fetch', CommentController.getComments);

export default router;
