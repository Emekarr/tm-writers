import { Request, Response, NextFunction } from 'express';

// services
import OtpService from '../services/otp_services';
import MessagingService from '../messaging/email_messenger';
import QueryService from '../services/query_service';
import RedisService from '../services/redis_service';
import UserServices from '../services/user_services';
import TokenService from '../services/token_service';
import WriterService from '../services/writer_service';

// utils
import CustomError from '../utils/error';
import ServerResponse from '../utils/response';
import { IUserDocument } from '../db/models/user';
import { IWriterDocument } from '../db/models/writer';

class OtpController {
	async requestOtp(req: Request, res: Response, next: NextFunction) {
		try {
			const { email, model } = req.body;
			QueryService.checkIfNull([email, model]);
			if (model === 'user') {
				const user = await RedisService.getUser(email);
				if (!user) throw new CustomError('user does not exist', 404);
			} else if (model === 'writer') {
				const writer = await RedisService.getWriter(email);
				if (!writer) throw new CustomError('writer does not exist', 404);
			} else {
				return new ServerResponse('model passed does not exist')
					.success(false)
					.statusCode(404)
					.respond(res);
			}
			const otp = OtpService.generateOtp();
			const newOtp = await OtpService.saveOtp(otp, email);
			if (!newOtp) throw new CustomError('Failed to create new otp', 400);
			const isSaved = await RedisService.cacheOtp(newOtp);
			if (!isSaved) return;
			if (process.env.NODE_ENV === 'TEST' || process.env.NODE_ENV === 'DEV') {
				return new ServerResponse('otp sent successfully')
					.data({ otp })
					.respond(res);
			} else if (process.env.NODE_ENV === 'PROD') {
				const success = await MessagingService.send(
					email as string,
					`DO NOT SHARE THIS MESSAGE WITH ANYONE\nYour OTP is ${otp}`,
					'Fresible Wallet Account Verification.',
				);
				if (!success) throw new CustomError('Failed to send otp', 400);
				return new ServerResponse('otp sent successfully').respond(res);
			} else {
				throw new CustomError('unknown environment running', 500);
			}
		} catch (err) {
			next(err);
		}
	}

	async verifyEmail(req: Request, res: Response, next: NextFunction) {
		try {
			const { otpCode, email, model } = req.body;
			QueryService.checkIfNull([otpCode, email, model]);
			const { match } = await OtpService.verifyOtp(otpCode, email);
			if (!match) throw new CustomError('otp validation failed', 400);
			let user!: IUserDocument | IWriterDocument | null;
			if (model === 'user') {
				const userDetails = await RedisService.getUser(email);
				if (!userDetails) {
					return new ServerResponse('User not found')
						.success(false)
						.statusCode(404)
						.respond(res);
				}
				user = await UserServices.createUser(userDetails);
				if (!user) throw new CustomError('user creation failed', 400);
				UserServices.updateUser(user._id, {
					verified_email: true,
				});
				user.verified_email = true;
			} else if (model === 'writer') {
				const writerDetails = await RedisService.getWriter(email);
				if (!writerDetails) {
					return new ServerResponse('Writer not found')
						.success(false)
						.statusCode(404)
						.respond(res);
				}
				user = await WriterService.createWriter({ ...writerDetails });
				if (!user) throw new CustomError('user creation failed', 400);
				WriterService.updateWriter(user._id, {
					verified_email: true,
				});
				user.verified_email = true;
			}
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
			new ServerResponse('Account email verified').data({ user }).respond(res);
		} catch (err) {
			next(err);
		}
	}

	async requestPasswordResetOtp(
		req: Request,
		res: Response,
		next: NextFunction,
	) {
		try {
			const { email, model } = req.body;
			QueryService.checkIfNull([email, model]);
			let account!: IUserDocument | IWriterDocument | null;
			if (model === 'user') {
				account = await UserServices.findByEmail(email);
			} else if (model === 'writer') {
				account = await WriterService.findByEmail(email);
			} else {
				throw new CustomError('unknown model used', 400);
			}
			if (!account)
				return new ServerResponse(
					`${email} that email is not registered to an account`,
				)
					.success(false)
					.statusCode(404)
					.respond(res);
			const otp = OtpService.generateOtp();
			const newOtp = await OtpService.saveOtp(otp, account._id);
			if (!newOtp) return new ServerResponse('failed to create new otp');
			const isSaved = await RedisService.cacheOtp(newOtp);
			if (!isSaved) return;
			if (process.env.NODE_ENV === 'TEST' || process.env.NODE_ENV === 'DEV') {
				new ServerResponse('otp sent successfully')
					.data({ otp, user: account._id })
					.respond(res);
			} else if (process.env.NODE_ENV === 'PROD') {
				const success = await MessagingService.send(
					email as string,
					`DO NOT SHARE THIS MESSAGE WITH ANYONE\nYour OTP is ${otp}`,
					'Fresible Wallet Account Verification.',
				);
				if (!success) throw new CustomError('Failed to send otp', 400);
				new ServerResponse('otp sent successfully')
					.data({ user: account._id })
					.respond(res);
			} else {
				throw new CustomError('unknown environment running', 500);
			}
		} catch (err) {
			next(err);
		}
	}

	async resetPassword(req: Request, res: Response, next: NextFunction) {
		try {
			const { otpCode, user, model, password } = req.body;
			QueryService.checkIfNull([otpCode, model, user, password]);
			const { match } = await OtpService.verifyOtp(otpCode, user);
			if (!match)
				return new ServerResponse('otp validation failed')
					.success(false)
					.statusCode(400)
					.respond(res);
			let account!: IUserDocument | IWriterDocument | null;
			if (model === 'user') {
				account = await UserServices.updateUser(user, {
					password,
				});
				if (!account) throw new CustomError('error updating password', 400);
			} else if (model === 'writer') {
				account = await WriterService.updateWriter(user, {
					password,
				});
				if (!account) throw new CustomError('error updating password', 400);
			} else {
				throw new CustomError('unknown model used', 400);
			}
			const { newAccessToken, newRefreshToken } =
				await TokenService.generateToken(
					req.socket.remoteAddress!,
					account._id,
				);
			if (!newAccessToken || !newRefreshToken)
				throw new Error('tokens could not be generated');
			res.cookie('ACCESS_TOKEN', newAccessToken, {
				httpOnly: true,
				maxAge: parseInt(process.env.ACCESS_TOKEN_LIFE as string, 10),
			});
			res.cookie('REFRESH_TOKEN', newRefreshToken, {
				httpOnly: true,
				maxAge: parseInt(process.env.REFRESH_TOKEN_LIFE as string, 10),
			});

			new ServerResponse('password reset successful')
				.data({ account })
				.respond(res);
		} catch (err) {
			next(err);
		}
	}
}

export default new OtpController();
