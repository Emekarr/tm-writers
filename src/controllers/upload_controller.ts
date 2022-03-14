import { Request, Response, NextFunction } from 'express';

// utils
import ServerResponse from '../utils/response';

// repository
import upload_repository from '../repository/mongodb/upload_repository';

export default abstract class UploadController {
	static async fetchUpload(req: Request, res: Response, next: NextFunction) {
		try {
			const { id } = req.query;
			const upload = await upload_repository.findById(id as string);
			if (!upload)
				new ServerResponse('Upload does not exist')
					.success(false)
					.statusCode(404)
					.respond(res);
			new ServerResponse('Upload fetched').data({ upload }).respond(res);
		} catch (err) {
			next(err);
		}
	}
}
