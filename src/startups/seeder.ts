import AdminRepository from '../repository/mongodb/admin_repository';

// create an admin account if it does not exist
export default async () => {
	const admin = await AdminRepository.findAll();
	if (admin.length === 0) {
		await AdminRepository.createEntry({
			username: 'admin',
			email: process.env.OUNJE_EMAIL,
			firstname: 'admin',
			lastname: 'admin',
			password: process.env.OUNJE_PASSWORD,
		});
	}
};
