import { Request, Response, NextFunction } from 'express';

// services
import QueryService from '../services/query_service';
import RedisService from '../services/redis_service';
import UserServices from '../services/user_services';
import TokenService from '../services/token_service';

// models
import { IUserDocument, User } from '../db/models/user';

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

	login = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { account, password } = req.body;
			QueryService.checkIfNull([account, password]);
			const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			let user: IUserDocument | null;
			if (email_regex.test(account)) {
				user = await UserServices.loginUserWithEmail(account, password);
			} else {
				user = await UserServices.loginUserWithUsername(account, password);
			}
			if (!user)
				return new ServerResponse('Login attempt failed')
					.success(false)
					.statusCode(400)
					.respond(res);
			const { newAccessToken, newRefreshToken } =
				await TokenService.generateToken(req.socket.remoteAddress!, user!._id);
			if (!newAccessToken || !newRefreshToken)
				throw new Error('tokens could not be generated');
			res.cookie('ACCESS_TOKEN', newAccessToken.token, {
				httpOnly: true,
				maxAge: parseInt(process.env.ACCESS_TOKEN_LIFE as string, 10),
			});
			res.cookie('REFRESH_TOKEN', newRefreshToken.token, {
				httpOnly: true,
				maxAge: parseInt(process.env.REFRESH_TOKEN_LIFE as string, 10),
			});
			new ServerResponse('Login attepmt successful').data(user).respond(res);
		} catch (err) {
			next(err);
		}
	};

	getUser = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.body;
			QueryService.checkIfNull([id]);
			const user = await UserServices.findById(id);
			if (!user)
				return new ServerResponse('User not found').data({}).respond(res);
			new ServerResponse('User found.').data(user).respond(res);
		} catch (err) {
			next(err);
		}
	};
}

export default new UserController();
