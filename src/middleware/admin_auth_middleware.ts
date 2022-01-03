import { Request, Response, NextFunction } from 'express';

import AdminRepository from '../db/mongodb/admin_repository';

export default async (req: Request, res: Response, next: NextFunction) => {
	try {
		const admin = await AdminRepository.findManyByFields(
			{ _id: req.id },
			{ limit: 1, page: 1 },
		);
		if (!admin) throw new Error('This route is for only admins');
		next();
	} catch (err) {
		next(err);
	}
};
