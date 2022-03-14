import UserRepository from '../../repository/mongodb/user_repository';
import { IUserDocument } from '../../db/models/mongodb/user';
import auth from '../../authentication/auth';
import { validateUpdateUser } from '../../validators/userValidators';

export default abstract class UpdatePasswordUserUseCase {
	private static UserRepository = UserRepository;

	private static auth = auth;

	private static validateUpdateUser = validateUpdateUser;

	static async execute(loginInfo: {
		id: string;
		password: string;
		new_password: string;
	}) {
		const response = this.validateUpdateUser({
			password: loginInfo.new_password,
		});
		if (response.error)
			return response.error.message || 'new password not valid';
		const user = (await this.UserRepository.findById(
			loginInfo.id,
		)) as IUserDocument | null;
		if (!user) return `User does not exist`;
		const success = await this.auth.verifyPassword(
			loginInfo.password,
			user.password,
		);
		if (!success) return 'Authentication failed.';
		user.password = loginInfo.new_password;
		return await this.UserRepository.saveData(user);
	}
}
