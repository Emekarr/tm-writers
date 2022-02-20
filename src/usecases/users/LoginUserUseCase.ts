import UserRepository from '../../repository/mongodb/user_repository';
import { IUserDocument } from '../../db/models/mongodb/user';
import auth from '../../authentication/auth';

export default abstract class LoginUserUseCase {
	private static UserRepository = UserRepository;

	private static auth = auth;

	static async execute(loginInfo: { email: string; password: string }) {
		const user = (await this.UserRepository.findOneByFields({
			email: loginInfo.email,
		})) as IUserDocument | null;
		if (!user) return `User does not exist with the email ${loginInfo.email}`;
		const success = await this.auth.verifyPassword(
			loginInfo.password,
			user.password,
		);
		if (!success) return 'Authentication failed.';
		return user;
	}
}
