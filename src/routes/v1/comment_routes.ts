import { Router } from 'express';

import CommentController from '../../controllers/comment_controller';

const router = Router();

router.post('/create', CommentController.createComment);

export default router;
