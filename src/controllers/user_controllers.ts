import { Request, Response, NextFunction } from 'express';

// services
import UserServices from '../services/user_services';
import OtpService from '../services/otp_services';
import MessagingService from '../services/messaging_service';
import QueryService from '../services/query_service';

// models
import { User } from '../model/user';

// utils
import CustomError from '../utils/error';
import ServerResponse from '../utils/response';

const create_user = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user_data: User = req.body;
		QueryService.checkIfNull([user_data]);
		const user = await UserServices.createUser(user_data);
		if (!user) throw new CustomError('Failed to create new user', 400);
		new ServerResponse('User created successfully').data(user).respond(res);
	} catch (err) {
		next(err);
	}
};

export default {
	create_user,
};
