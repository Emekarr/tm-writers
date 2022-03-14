import UserRepository from '../../repository/mongodb/user_repository';
import { IUserDocument, User } from '../../db/models/mongodb/user';
import { validateUpdateUser } from '../../validators/userValidators';

export default abstract class UpdateUserUseCase {
	private static UserRepository = UserRepository;

	private static validateUpdateUser = validateUpdateUser;

	static async execute(data: Partial<User>, user: string) {
		const update = this.validateUpdateUser(data);
		if (update.error) return update.error.message || 'new user data invalid';
		return this.UserRepository.updateByFields({ id: user }, update);
	}
}
