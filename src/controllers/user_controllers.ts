import { Request, Response, NextFunction } from 'express';

// services
import QueryService from '../services/query_service';
import RedisService from '../services/redis_service';
import UserServices from '../services/user_services';

// models
import { User } from '../model/user';

// utils
import CustomError from '../utils/error';
import ServerResponse from '../utils/response';

class UserController {
	createUser = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { email, password, lastname, firstname, username } = req.body;
			QueryService.checkIfNull([
				email,
				password,
				lastname,
				firstname,
				username,
			]);
			const user_data: User = {
				email,
				password,
				lastname,
				firstname,
				username,
			};
			const userWithEmail = await UserServices.findByEmail(user_data.email!);
			if (userWithEmail)
				return new ServerResponse('User with email already exist')
					.statusCode(400)
					.success(false)
					.respond(res);
			const userWithUsername = await UserServices.findByUsername(
				user_data.username!,
			);
			if (userWithUsername)
				return new ServerResponse('User with username already exist')
					.statusCode(400)
					.success(false)
					.respond(res);
			const success = await RedisService.cacheUser(user_data);
			if (!success)
				throw new CustomError('something went wrong while saving user', 400);
			new ServerResponse('User created successfully').respond(res);
		} catch (err) {
			next(err);
		}
	};
}

export default new UserController();
