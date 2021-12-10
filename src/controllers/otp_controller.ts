import { Request, Response, NextFunction } from 'express';

// services
import OtpService from '../services/otp_services';
import MessagingService from '../services/messaging_service';
import QueryService from '../services/query_service';
import RedisService from '../services/redis_service';
import UserServices from '../services/user_services';
import TokenService from '../services/token_service';
import WriterService from '../services/writer_service';

// utils
import CustomError from '../utils/error';
import ServerResponse from '../utils/response';
import { IUserDocument } from '../model/user';
import { IWriterDocument } from '../model/writer';

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
				const { success } = await MessagingService.sendEmail(
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
				user = await UserServices.createUser({ ...userDetails });
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
}

export default new OtpController();
