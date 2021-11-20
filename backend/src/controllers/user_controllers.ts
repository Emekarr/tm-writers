import { Request, Response, NextFunction } from 'express';

// services
import user_services from '../services/user_services';
const { create_user_service } = user_services;

// models
import { User } from '../model/user';

// utils
import CustomError from '../utils/error';
import ServerResponse from '../utils/response';

const create_user = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user_data: User = req.body;
		const user = await create_user_service(user_data);
		if (!user) throw new CustomError('Failed to create new user', 400);
		new ServerResponse('User created successfully').data(user).respond(res);
	} catch (err) {
		next(err);
	}
};

export default {
	create_user,
};
