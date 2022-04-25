import { Request, Response, NextFunction } from 'express';

// usecases
import CreateNewProjectUseCase from '../usecases/project/CreateNewProjectUseCase';
import UpdateProjectUseCase from '../usecases/project/UpdateProjectUseCase';

// utils
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

	static async updateProject(req: Request, res: Response, next: NextFunction) {
		try {
			const projectData = req.body;
			const result = await UpdateProjectUseCase.execute(projectData);
			if (typeof result === 'string' || !result)
				return new ServerResponse(
					result ||
						'something went wrong while updating your project. Please safe offline for now and trya gain later.',
				)
					.statusCode(400)
					.success(false)
					.respond(res);
			new ServerResponse('Project updated successfully').respond(res);
		} catch (err) {
			next(err);
		}
	}
}
