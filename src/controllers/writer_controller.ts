import { Request, Response, NextFunction } from 'express';

// services
import WriterService from '../services/writer_service';
import QueryService from '../services/query_service';

// models
import { IWriter, Writer } from '../model/writer';

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
				return new ServerResponse('User with email already exist')
					.statusCode(400)
					.success(false)
					.respond(res);
			const writerWithUsername = await WriterService.findByUsername(
				writer_data.username!,
			);
			if (writerWithUsername)
				return new ServerResponse('User with username already exist')
					.statusCode(400)
					.success(false)
					.respond(res);
			const success = await RedisService.cacheWriter(writer_data);
			if (!success)
				throw new CustomError('something went wrong while saving user', 400);
			new ServerResponse('Writer created successfully').respond(res);
		} catch (err) {
			next(err);
		}
	};
}

export default new WriterController();
