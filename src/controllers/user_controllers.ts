import { Response, Request, NextFunction } from 'express';

// utils
import generate_otp from '../utils/generate_otp';
import ServerResponse from '../utils/response';
import { hashData } from '../utils/hash';
import validate_body from '../utils/validate_body';

// usecases
import CacheOtpUseCase from '../usecases/otp/CacheOtpUseCase';
import CacheUserUseCase from '../usecases/users/CacheUserUseCase';
import CreateUserUseCase from '../usecases/users/CreateNewUserUseCase';
import CreateAuthTokenUseCase from '../usecases/authentication/CreateAuthTokensUseCase';
import LoginUserUseCase from '../usecases/users/LoginUserUseCase';
import VerifyOtpUseCase from '../usecases/otp/VerifyOtpUseCase';
import UpdatePasswordUserUseCase from '../usecases/users/UpdateUserPasswordUseCase';
import UpdateUserUseCase from '../usecases/users/UpdateUserUseCase';

// messaging
import EmailMesssenger from '../messaging/email_messenger';

// repository
import RedisRepository from '../repository/redis/redis_repository';
import user_repository from '../repository/mongodb/user_repository';

// events
import notif_events from '../events/notifications/notif_events';
import Emitter from '../events/emitter';

// services
import MediaService from '../services/MediaService';

export default abstract class UserController {
	static async createUser(req: Request, res: Response, next: NextFunction) {
		try {
			const user = req.body;
			user.profile_image = req.file?.buffer;
			const created_user = await CacheUserUseCase.execute(user);
			if (typeof created_user === 'string')
				return new ServerResponse(created_user)
					.statusCode(400)
					.success(false)
					.respond(res);
			const code = generate_otp();
			const saved = await CacheOtpUseCase.execute({
				code: await hashData(code),
				contact: user.email,
			});
			if (!saved)
				return new ServerResponse('Otp sending failed')
					.statusCode(400)
					.success(false)
					.respond(res);
			if (process.env.NODE_ENV === 'production') {
				await EmailMesssenger.send(
					user.email,
					`This email is being used to create an account on TDM Writers\n ${code} is your otp`,
					'Welcome to TDM Writers',
				);
			} else if (process.env.NODE_ENV === 'DEV') {
				return new ServerResponse('User created and Otp sent successfully')
					.data({ code })
					.respond(res);
			}
			new ServerResponse('User created and Otp sent successfully').respond(res);
		} catch (err) {
			next(err);
		}
	}

	static async verifyAccount(req: Request, res: Response, next: NextFunction) {
		try {
			const { code, email } = req.body;
			const account = await RedisRepository.findOne(`${email}-user`);
			if (!account)
				return new ServerResponse('User does not exist')
					.statusCode(404)
					.success(false)
					.respond(res);
			const result = await VerifyOtpUseCase.execute(`${email}-otp`, code);
			if (!result)
				return new ServerResponse('Otp does not match. Please try again')
					.success(false)
					.statusCode(400)
					.respond(res);
			await RedisRepository.deleteOne(`${email}-otp`);
			const user = await RedisRepository.findOne(`${email}-user`);
			if (!user)
				return new ServerResponse('Otp has expired.')
					.success(false)
					.statusCode(400)
					.respond(res);
			(user as any).verified_email = true;
			const created_user = await CreateUserUseCase.execute(user as any);
			if (typeof created_user === 'string' || !created_user)
				return new ServerResponse(
					created_user || 'Something went wrong while creating user',
				)
					.success(false)
					.statusCode(400)
					.respond(res);
			await RedisRepository.deleteOne(`${email}-user`);
			const tokens = await CreateAuthTokenUseCase.execute(
				req.ip,
				created_user._id.toString(),
				'user',
			);
			if (typeof tokens === 'string' || !tokens)
				return new ServerResponse(
					tokens || 'Something went wrong while generating tokens',
				)
					.success(false)
					.statusCode(400)
					.respond(res);
			res.cookie('ACCESS_TOKEN', tokens.newAccessToken.token, {
				maxAge: parseInt(process.env.ACCESS_TOKEN_LIFE as string, 10),
			});
			res.cookie('REFRESH_TOKEN', tokens.newRefreshToken.token, {
				maxAge: parseInt(process.env.REFRESH_TOKEN_LIFE as string, 10),
			});
			// send welcome notification
			Emitter.emit(notif_events.USER_CREATED.EVENT, {
				heading: 'Welcome to TDM Writers',
				body: 'content',
				reciever: created_user._id,
			});
			new ServerResponse('Email verified and user saved')
				.data({
					user: created_user,
					ACCESS_TOKEN: tokens.newAccessToken.token,
					REFRESH_TOKEKN: tokens.newRefreshToken.token,
				})
				.statusCode(201)
				.respond(res);
		} catch (err) {
			next(err);
		}
	}

	static async loginUser(req: Request, res: Response, next: NextFunction) {
		try {
			const loginInfo = req.body;
			const invalid = validate_body([loginInfo.email, loginInfo.password]);
			if (invalid)
				return new ServerResponse(invalid)
					.success(false)
					.statusCode(400)
					.respond(res);
			const user = await LoginUserUseCase.execute(loginInfo);
			if (typeof user === 'string' || !user)
				return new ServerResponse(
					user || 'Something went wrong while trying to sign you in',
				)
					.success(false)
					.statusCode(400)
					.respond(res);
			const tokens = await CreateAuthTokenUseCase.execute(
				req.ip,
				user._id.toString(),
				'user',
			);
			if (typeof tokens === 'string' || !tokens)
				return new ServerResponse(
					tokens || 'Something went wrong while generating tokens',
				)
					.success(false)
					.statusCode(400)
					.respond(res);
			res.cookie('ACCESS_TOKEN', tokens.newAccessToken.token, {
				maxAge: parseInt(process.env.ACCESS_TOKEN_LIFE as string, 10),
			});
			res.cookie('REFRESH_TOKEN', tokens.newRefreshToken.token, {
				maxAge: parseInt(process.env.REFRESH_TOKEN_LIFE as string, 10),
			});
			new ServerResponse('Login successful')
				.data({
					user,
					ACCESS_TOKEN: tokens.newAccessToken.token,
					REFRESH_TOKEKN: tokens.newRefreshToken.token,
				})
				.respond(res);
		} catch (err) {
			next(err);
		}
	}

	static async updateUserPassword(
		req: Request,
		res: Response,
		next: NextFunction,
	) {
		try {
			const passwordInfo = req.body;
			const invalid = validate_body([
				passwordInfo.new_password,
				passwordInfo.old_password,
			]);
			if (invalid)
				return new ServerResponse(invalid)
					.success(false)
					.statusCode(400)
					.respond(res);
			const user = await UpdatePasswordUserUseCase.execute({
				id: req.id,
				password: passwordInfo.old_password,
				new_password: passwordInfo.new_password,
			});
			if (typeof user === 'string' || !user)
				return new ServerResponse(
					user || 'Something went wrong while trying to update password',
				)
					.success(false)
					.statusCode(400)
					.respond(res);
			new ServerResponse('Password Updated successfully').respond(res);
		} catch (err) {
			next(err);
		}
	}

	static async updateUser(req: Request, res: Response, next: NextFunction) {
		try {
			const data = req.body;
			const { public_id } = req.query;
			if (Object.keys(data).length === 0 && !req.file)
				return new ServerResponse('Please provide data to be updated')
					.success(false)
					.statusCode(400)
					.respond(res);
			// if (req.file) {
			// 	if (!public_id)
			// 		return new ServerResponse(
			// 			'Please provide the public_id of the upload',
			// 		)
			// 			.success(false)
			// 			.statusCode(400)
			// 			.respond(res);
			// 	await MediaService.updateData(
			// 		req.file.buffer,
			// 		'profile-images-users',
			// 		public_id as string,
			// 	);
			// }
			data.profile_image = req.file?.buffer;
			const updated = await UpdateUserUseCase.execute(data, req.id);
			if (typeof updated === 'string' || !updated)
				return new ServerResponse(updated || 'failed to update user')
					.success(false)
					.statusCode(400)
					.respond(res);
			new ServerResponse('user updated').respond(res);
		} catch (err) {
			next(err);
		}
	}

	static async getUser(req: Request, res: Response, next: NextFunction) {
		try {
			const { id } = req.query;
			const invalid = validate_body([id]);
			if (invalid)
				return new ServerResponse(invalid)
					.success(false)
					.statusCode(400)
					.respond(res);
			const user = await user_repository.findById(id as string);
			if (!user)
				return new ServerResponse('User not found').data({}).respond(res);
			new ServerResponse('User found.').data(user).respond(res);
		} catch (err) {
			next(err);
		}
	}

	static async deleteAccount(req: Request, res: Response, next: NextFunction) {
		try {
			const deleted = await user_repository.deleteById(req.id);
			if (typeof deleted === 'string' || !deleted)
				return new ServerResponse(
					deleted || 'something went wrong while performing operaion',
				)
					.statusCode(400)
					.success(false)
					.respond(res);
			new ServerResponse('Account deleted').respond(res);
		} catch (err) {
			next(err);
		}
	}

	static async sendContactEmail(
		req: Request,
		res: Response,
		next: NextFunction,
	) {
		try {
			const data = req.body;
			const invalid = validate_body([data.email, data.body, data.name]);
			if (invalid)
				return new ServerResponse(invalid)
					.success(false)
					.statusCode(400)
					.respond(res);
			await EmailMesssenger.send(
				process.env.TDM_EMAIL as string,
				`${data.body}\nContact Email---- ${data.email}`,
				`Admin, ${data.name} has contacted TDM`,
			);
			new ServerResponse('Your enqiry has been sent').respond(res);
		} catch (err) {
			next(err);
		}
	}
}
