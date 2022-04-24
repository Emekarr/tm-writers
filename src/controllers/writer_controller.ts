import { Response, Request, NextFunction } from 'express';

// utils
import generate_otp from '../utils/generate_otp';
import ServerResponse from '../utils/response';
import { hashData } from '../utils/hash';
import validate_body from '../utils/validate_body';

// usecases
import CacheOtpUseCase from '../usecases/otp/CacheOtpUseCase';
import CacheWriterUseCase from '../usecases/writers/CacheWriterUseCase';
import CreateNewWriterUseCase from '../usecases/writers/CreateNewWriterUseCase';
import CreateAuthTokenUseCase from '../usecases/authentication/CreateAuthTokensUseCase';
import LoginWriterUseCase from '../usecases/writers/LoginWriterUseCase';
import VerifyOtpUseCase from '../usecases/otp/VerifyOtpUseCase';
import UpdateWriterPasswordUseCase from '../usecases/writers/UpdateWriterPasswordUseCase';
import ApproveWriterUseCase from '../usecases/writers/ApproveWriterUseCase';
import RejectWriterUseCase from '../usecases/writers/RejectWriterUseCase';
import UpdateWriterUseCase from '../usecases/writers/UpdateWriterUseCase';

// messaging
import EmailMesssenger from '../messaging/email_messenger';

// repository
import RedisRepository from '../repository/redis/redis_repository';
import writer_repository from '../repository/mongodb/writer_repository';

export default abstract class WriterController {
	static async createWriter(req: Request, res: Response, next: NextFunction) {
		try {
			const writer = req.body;
			if (req.files) {
				for (let i = 0; i < req.files.length; i++) {
					const file = (req.files as any)[i];
					writer[file.originalname.split('.', 1)] = file.buffer;
				}
			}
			const created_writer = await CacheWriterUseCase.execute(writer);
			if (typeof created_writer === 'string')
				return new ServerResponse(created_writer)
					.statusCode(400)
					.success(false)
					.respond(res);
			const code = generate_otp();
			const saved = await CacheOtpUseCase.execute({
				code: await hashData(code),
				contact: writer.email,
			});
			if (!saved)
				return new ServerResponse('Otp sending failed')
					.statusCode(400)
					.success(false)
					.respond(res);
			if (process.env.NODE_ENV === 'PROD') {
				await EmailMesssenger.send(
					writer.email,
					`This email is being used to create an account on TDM Writers\n ${code} is your otp`,
					'Welcome to TDM Writers',
				);
			} else if (process.env.NODE_ENV === 'DEV') {
				return new ServerResponse('writer created and Otp sent successfully')
					.data({ code })
					.respond(res);
			}
			new ServerResponse('writer created and Otp sent successfully').respond(
				res,
			);
		} catch (err) {
			next(err);
		}
	}

	static async verifyAccount(req: Request, res: Response, next: NextFunction) {
		try {
			const { code, email } = req.body;
			const account = await RedisRepository.findOne(`${email}-writer`);
			if (!account)
				return new ServerResponse('writer does not exist')
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
			const writer = await RedisRepository.findOne(`${email}-writer`);
			if (!writer)
				return new ServerResponse('Otp has expired.')
					.success(false)
					.statusCode(400)
					.respond(res);
			(writer as any).verified_email = true;
			const created_writer = await CreateNewWriterUseCase.execute(
				writer as any,
			);
			if (typeof created_writer === 'string' || !created_writer)
				return new ServerResponse(
					created_writer || 'Something went wrong while creating writer',
				)
					.success(false)
					.statusCode(400)
					.respond(res);
			await RedisRepository.deleteOne(`${email}-writer`);
			const tokens = await CreateAuthTokenUseCase.execute(
				req.ip,
				created_writer._id.toString(),
				'writer-unapproved',
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
			new ServerResponse('Email verified and writer saved')
				.data({
					writer: created_writer,
					ACCESS_TOKEN: tokens.newAccessToken.token,
					REFRESH_TOKEKN: tokens.newRefreshToken.token,
				})
				.statusCode(201)
				.respond(res);
		} catch (err) {
			next(err);
		}
	}

	static async loginWriter(req: Request, res: Response, next: NextFunction) {
		try {
			const loginInfo = req.body;
			const invalid = validate_body([loginInfo.email, loginInfo.password]);
			if (invalid)
				return new ServerResponse(invalid)
					.success(false)
					.statusCode(400)
					.respond(res);
			const writer = await LoginWriterUseCase.execute(loginInfo);
			if (typeof writer === 'string' || !writer)
				return new ServerResponse(
					writer || 'Something went wrong while trying to sign you in',
				)
					.success(false)
					.statusCode(400)
					.respond(res);
			const tokens = await CreateAuthTokenUseCase.execute(
				req.ip,
				writer._id.toString(),
				'writer',
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
					writer,
					ACCESS_TOKEN: tokens.newAccessToken.token,
					REFRESH_TOKEKN: tokens.newRefreshToken.token,
				})
				.respond(res);
		} catch (err) {
			next(err);
		}
	}

	static async getWriter(req: Request, res: Response, next: NextFunction) {
		try {
			const { id } = req.query;
			const invalid = validate_body([id]);
			if (invalid)
				return new ServerResponse(invalid)
					.success(false)
					.statusCode(400)
					.respond(res);
			const writer = await writer_repository.findById(id as string);
			if (!writer)
				return new ServerResponse('writer not found').data({}).respond(res);
			new ServerResponse('writer found.').data(writer).respond(res);
		} catch (err) {
			next(err);
		}
	}

	static async getWriters(req: Request, res: Response, next: NextFunction) {
		try {
			const { approved_writer, page, limit } = req.query;
			const invalid = validate_body([approved_writer]);
			if (invalid)
				return new ServerResponse(invalid)
					.success(false)
					.statusCode(400)
					.respond(res);
			const writers = await writer_repository.findManyByFields(
				{ approved_writer },
				{ page: Number(page), limit: Number(limit) },
			);
			new ServerResponse('Writers fetched successfully')
				.data(writers)
				.respond(res);
		} catch (err) {
			next(err);
		}
	}

	static async approveWriter(req: Request, res: Response, next: NextFunction) {
		try {
			const { writerId } = req.query;
			const response = await ApproveWriterUseCase.execute(writerId as string);
			if (typeof response === 'string') {
				return new ServerResponse(
					response || 'something went wrong while approving writer',
				)
					.success(false)
					.statusCode(200)
					.respond(res);
			}
			new ServerResponse('writer approved successfully').respond(res);
		} catch (err) {
			next(err);
		}
	}

	static async rejectWriter(req: Request, res: Response, next: NextFunction) {
		try {
			const { writerId } = req.query;
			const response = await RejectWriterUseCase.execute(writerId as string);
			if (typeof response === 'string') {
				return new ServerResponse(
					response || 'something went wrong while approving writer',
				)
					.success(false)
					.statusCode(200)
					.respond(res);
			}
			new ServerResponse('writer rejected successfully').respond(res);
		} catch (err) {
			next(err);
		}
	}

	static async updateWriterPassword(
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
			const user = await UpdateWriterPasswordUseCase.execute({
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

	static async updateWriter(req: Request, res: Response, next: NextFunction) {
		try {
			const data = req.body;
			if (Object.keys(data).length === 0 && !req.file)
				return new ServerResponse('Please provide data to be updated')
					.success(false)
					.statusCode(400)
					.respond(res);
			data.profile_image = req.file?.buffer;
			const updated = await UpdateWriterUseCase.execute(data, req.id);
			if (typeof updated === 'string' || !updated)
				return new ServerResponse(updated || 'failed to update writer')
					.success(false)
					.statusCode(400)
					.respond(res);
			new ServerResponse('writer updated').respond(res);
		} catch (err) {
			next(err);
		}
	}
}
