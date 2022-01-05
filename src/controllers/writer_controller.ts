import { Request, Response, NextFunction } from 'express';

// services
import WriterService from '../services/writer_service';
import QueryService from '../services/query_service';
import TokenService from '../services/token_service';

// models
import { IWriter, Writer, IWriterDocument } from '../db/models/writer';

// utils
import CustomError from '../utils/error';
import ServerResponse from '../utils/response';
import RedisService from '../services/redis_service';

class WriterController {
	sign_up_writer = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const {
				email,
				password,
				lastname,
				firstname,
				username,
				country,
				mobile,
				address,
				nearest_landmark,
				highest_qualificaiton,
				experience,
				academic_work,
				strength,
				weakness,
			} = req.body;
			QueryService.checkIfNull([
				email,
				password,
				lastname,
				firstname,
				username,
				country,
				mobile,
				address,
				nearest_landmark,
				highest_qualificaiton,
				experience,
				academic_work,
				strength,
				weakness,
			]);
			const writer_data: Writer = {
				email,
				password,
				lastname,
				firstname,
				username,
				country,
				mobile,
				address,
				nearest_landmark,
				highest_qualificaiton,
				experience,
				academic_work,
				strength,
				weakness,
			};
			const writerWithEmail = await WriterService.findByEmail(
				writer_data.email!,
			);
			if (writerWithEmail)
				return new ServerResponse('writer with email already exist')
					.statusCode(400)
					.success(false)
					.respond(res);
			const writerWithusername = await WriterService.findByUsername(
				writer_data.username!,
			);
			if (writerWithusername)
				return new ServerResponse('writer with username already exist')
					.statusCode(400)
					.success(false)
					.respond(res);
			const success = await RedisService.cacheWriter(writer_data);
			if (!success)
				throw new CustomError('something went wrong while saving writer', 400);
			new ServerResponse('Writer created successfully').respond(res);
		} catch (err) {
			next(err);
		}
	};

	login = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { account, password } = req.body;
			QueryService.checkIfNull([account, password]);
			const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			let writer: IWriterDocument | null;
			if (email_regex.test(account)) {
				writer = await WriterService.loginWriterWithEmail(account, password);
			} else {
				writer = await WriterService.loginWriterWithUsername(account, password);
			}
			if (!writer)
				return new ServerResponse('Login attempt failed')
					.success(false)
					.statusCode(400)
					.respond(res);
			const { newAccessToken, newRefreshToken } =
				await TokenService.generateToken(
					req.socket.remoteAddress!,
					writer!._id,
				);
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
			new ServerResponse('Login attepmt successful').data(writer).respond(res);
		} catch (err) {
			next(err);
		}
	};

	getWriter = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.query;
			QueryService.checkIfNull([id]);
			const writer = await WriterService.findById(id as string);
			if (!writer)
				return new ServerResponse('Writer not found').data({}).respond(res);
			new ServerResponse('Writer found.').data(writer).respond(res);
		} catch (err) {
			next(err);
		}
	};
}

export default new WriterController();
