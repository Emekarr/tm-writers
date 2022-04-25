import { Router } from 'express';

import ProjectController from '../../controllers/project_controller';

import special_auth_middleware from '../../middleware/authentication/special_auth_middleware';

const router = Router();

router.post(
	'/create',
	special_auth_middleware('writer'),
	ProjectController.createProject,
);

router.put(
	'/update',
	special_auth_middleware('writer'),
	ProjectController.updateProject,
);

export default router;
