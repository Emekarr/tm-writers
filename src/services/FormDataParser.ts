import multer from 'multer';

import CustomError from '../utils/error';

export default abstract class FormDataParser {
	private static multer = multer({
		limits: {
			fieldSize: 5000000,
		},
		fileFilter(req, file, cb) {
			try {
				if (
					!file.originalname.endsWith('.jpeg') &&
					!file.originalname.endsWith('.jpg') &&
					!file.originalname.endsWith('.png') &&
					!file.originalname.endsWith('.pdf')
				) {
					cb(new CustomError('Unsupported file fomart passed', 400));
				}

				cb(null, true);
			} catch (err) {
				console.log(err);
			}
		},
	});

	static uploadMultiple(name: string, count: number) {
		return this.multer.array(name, count);
	}
}
