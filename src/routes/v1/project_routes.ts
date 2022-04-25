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

router.get(
	'/all',
	special_auth_middleware('writer', 'admin'),
	ProjectController.fetchProjects,
);

router.get('/get-project', ProjectController.getOneProject);

export default router;
