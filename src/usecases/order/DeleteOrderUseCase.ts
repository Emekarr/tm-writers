import order_repository from '../../repository/mongodb/order_repository';

export default abstract class DeleteOrderUseCase {
	private static repo = order_repository;

	static async execute(id: string) {
		return await this.repo.deleteById(id);
	}
}
