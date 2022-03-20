import { Router } from 'express';

import special_auth_middleware from '../../middleware/authentication/special_auth_middleware';

import CommentController from '../../controllers/comment_controller';

const router = Router();

router.post(
	'/create',
	special_auth_middleware('admin', 'user', 'writer'),
	CommentController.createComment,
);

router.get(
	'/fetch',
	special_auth_middleware('admin', 'user', 'writer'),
	CommentController.getComments,
);

router.delete(
	'/delete',
	special_auth_middleware('admin', 'user', 'writer'),
	CommentController.deleteComment,
);

export default router;
