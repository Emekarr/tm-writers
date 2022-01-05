import { compare } from 'bcrypt';

import { IAdminDocument } from '../db/models/admin';

import AdminRepository from '../db/mongodb/admin_repository';

class AdminService {
	async loginAdmin(password: string): Promise<IAdminDocument | null> {
		let admin!: IAdminDocument | null;
		try {
			admin = (await AdminRepository.findAll())[0] as IAdminDocument;
			const logged_in = await compare(password, admin.password!);
			if (!logged_in) throw new Error('Login failed');
		} catch (err) {
			admin = null;
		}
		return admin;
	}
}

export default Object.freeze(new AdminService());
