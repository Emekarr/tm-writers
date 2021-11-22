import { Request, Response, NextFunction } from 'express';

// services
import WriterService from '../services/writer_service';
import QueryService from '../services/query_service';

// models
import { IWriter, Writer } from '../model/writer';

// utils
import CustomError from '../utils/error';
import ServerResponse from '../utils/response';

const sign_up_writer = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const writer_data: Writer = req.body;
		QueryService.checkIfNull([writer_data]);
		const writer = await WriterService.createWriter(writer_data);
		if (!writer) throw new CustomError('Failed to create new writer', 400);
		new ServerResponse('Writer created successfully').data(writer).respond(res);
	} catch (err) {
		next(err);
	}
};

export default {
	sign_up_writer,
};
