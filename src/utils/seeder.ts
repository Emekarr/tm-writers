import AdminRepository from '../db/mongodb/admin_repository';

// create an admin account if it does not exist
(async () => {
	const admin = await AdminRepository.findAll();
	if (!admin) {
		await AdminRepository.createEntry({
			name: 'admin',
			email: process.env.TDM_EMAIL,
			firstname: 'admin',
			lastname: 'admin',
			password: process.env.TDM_PASSWORD,
			phoneNumber: process.env.TDM_MOBILE,
		});
	}
})();
