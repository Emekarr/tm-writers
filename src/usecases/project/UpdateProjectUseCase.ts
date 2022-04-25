import project_repository from '../../repository/mongodb/project_repository';
import { validateUpdateNewProject } from '../../validators/project_validators';
import { Project } from '../../db/models/mongodb/project';
import { IOrderDocument } from '../../db/models/mongodb/order';
import OrderState from '../../utils/types/order_state';

export default abstract class UpdateProjectUseCase {
	private static project_repository = project_repository;

	private static validateUpdateNewProject = validateUpdateNewProject;

	static async execute(project: Partial<Project>) {
		const validated = this.validateUpdateNewProject(project);
		if (validated.error)
			return `an error occured while updating your project : ${validated.error.message}`;
		await this.project_repository.saveData(validated.value);
		return true;
	}
}
