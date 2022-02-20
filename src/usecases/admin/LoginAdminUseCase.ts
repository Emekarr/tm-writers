import AdminRepository from '../../repository/mongodb/admin_repository';
import { IAdminDocument } from '../../db/models/mongodb/admin';
import auth from '../../authentication/auth';

export default abstract class LoginAdminUseCase {
	private static AdminRepository = AdminRepository;

	private static auth = auth;

	static async execute(loginInfo: { email: string; password: string }) {
		const admin = (await this.AdminRepository.findOneByFields({
			email: loginInfo.email,
		})) as IAdminDocument | null;
		if (!admin) return `admin does not exist with the email ${loginInfo.email}`;
		const success = await this.auth.verifyPassword(
			loginInfo.password,
			admin.password,
		);
		if (!success) return 'Authentication failed.';
		return admin;
	}
}
