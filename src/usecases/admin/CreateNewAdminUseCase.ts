import { Admin, IAdminDocument } from '../../db/models/mongodb/admin';
import AdminRepository from '../../repository/mongodb/admin_repository';
import { validateNewAdminData } from '../../validators/adminValidators';

export default abstract class CreateNewAdminUseCase {
	private static AdminRepository = AdminRepository;

	private static validateNewAdminData = validateNewAdminData;

	static async execute(data: Admin) {
		const admin = this.validateNewAdminData(data);
		if (admin.error)
			return `an error occured while creating an admin :- ${admin.error.message}`;
		const existingAdminEmail = await this.AdminRepository.findManyByFields({
			email: data.email,
		});
		if (existingAdminEmail) return `admin with this email already exists`;

		const existingAdminName = await this.AdminRepository.findManyByFields({
			name: data.name,
		});
		if (existingAdminName) return `admin with this name already exists`;
		return (await this.AdminRepository.createEntry(
			admin.value,
		)) as IAdminDocument;
	}
}
