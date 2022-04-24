import { Request, Response, NextFunction } from 'express';

import CreateNewProjectUseCase from '../usecases/project/CreateNewProjectUseCase';
import ServerResponse from '../utils/response';

export default class ProjectController {
	static async createProject(req: Request, res: Response, next: NextFunction) {
		try {
			const projectData = req.body;
			const result = await CreateNewProjectUseCase.execute(projectData);
			if (typeof result === 'string' || !result)
				return new ServerResponse(
					result || 'something went wrong while creating your project',
				)
					.statusCode(400)
					.success(false)
					.respond(res);
			new ServerResponse('Project created successfully').respond(res);
		} catch (err) {
			next(err);
		}
	}
}
