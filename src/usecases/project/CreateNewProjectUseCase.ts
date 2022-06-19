import project_repository from '../../repository/mongodb/project_repository';
import order_repository from '../../repository/mongodb/order_repository';
import { validateCreateNewProject } from '../../validators/project_validators';
import { Project } from '../../db/models/mongodb/project';
import { IOrderDocument } from '../../db/models/mongodb/order';
import OrderState from '../../utils/types/order_state';

export default abstract class CreateNewProjectUseCase {
	private static project_repository = project_repository;

	private static order_repository = order_repository;

	private static validateCreateNewProject = validateCreateNewProject;

	static async execute(data: Project) {
		const validated = this.validateCreateNewProject(data);
		if (validated.error)
			return `an error occured while creating your project : ${validated.error.message}`;
		const order = (await this.order_repository.findById(
			data.order,
		)) as IOrderDocument;
		if (order.assignedTo.toString() !== data.writer)
			return `You are not assigned to this order`;
		order.state = OrderState.IN_PROGRESS;
		await this.order_repository.saveData(order);
		return await this.project_repository.createEntry(validated.value);
	}
}
