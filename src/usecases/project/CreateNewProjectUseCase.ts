import project_repository from '../../repository/mongodb/project_repository';
import order_repository from '../../repository/mongodb/order_repository';
import { validateUpdateNewProject } from '../../validators/project_validators';
import { Project } from '../../db/models/mongodb/project';
import { IOrderDocument } from '../../db/models/mongodb/order';

export default abstract class CreateNewProjectUseCase {
	private static project_repository = project_repository;

	private static order_repository = order_repository;

	private static validateUpdateNewProject = validateUpdateNewProject;

	static async execute(data: Project) {
		const validated = this.validateUpdateNewProject(data);
		if (validated.error)
			return `an error occured while creating your project : ${validated.error.message}`;
		const order = (await this.order_repository.findById(
			data.order,
		)) as IOrderDocument;
		if (order.assignedTo.toString() !== data.writer)
			return `You are not assigned to this order`;
		return await this.project_repository.createEntry(validated.value);
	}
}
