import { Request, Response, NextFunction } from 'express';
import project_repository from '../repository/mongodb/project_repository';

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

	static async fetchProjects(req: Request, res: Response, next: NextFunction) {
		try {
			const { page, limit } = req.query;
			const projects = await project_repository.findManyByFields(
				{
					writer: req.id,
				},
				{ limit: Number(limit), page: Number(page) },
			);
			new ServerResponse('Projects retrieved successfully')
				.data(projects)
				.respond(res);
		} catch (err) {
			next(err);
		}
	}

	static async getOneProject(req: Request, res: Response, next: NextFunction) {
		try {
			const { id } = req.query;
			const project = await project_repository.findById(id as string);
			if (!project)
				return new ServerResponse('Project does not exist')
					.statusCode(404)
					.success(false)
					.respond(res);
			new ServerResponse('project retrieved successfully')
				.data(project)
				.respond(res);
		} catch (err) {
			next(err);
		}
	}
}
