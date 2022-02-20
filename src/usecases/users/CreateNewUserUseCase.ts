import { validateCreateNewUser } from '../../validators/userValidators';
import { User, IUserDocument } from '../../db/models/mongodb/user';
import UserRepository from '../../repository/mongodb/user_repository';

export default abstract class CacheUserUseCase {
	private static validateCreateNewUser = validateCreateNewUser;

	private static UserRepository = UserRepository;

	static async execute(data: User) {
		const user = this.validateCreateNewUser(data);
		if (user.error) return `invalid data provided : ${user.error}`;
		return (await this.UserRepository.createEntry(
			user.value,
		)) as IUserDocument | null;
	}
}
