import { Request, Response, NextFunction } from 'express';

import LoginAdminUseCase from '../usecases/admin/LoginAdminUseCase';
import CreateAuthTokenUseCase from '../usecases/authentication/CreateAuthTokensUseCase';
import CreateNewAdminUseCase from '../usecases/admin/CreateNewAdminUseCase';

// utils
import validate_body from '../utils/validate_body';
import ServerResponse from '../utils/response';

export default abstract class AdminController {
	static async login(req: Request, res: Response, next: NextFunction) {
		try {
			const loginInfo = req.body;
			const invalid = validate_body([loginInfo.email, loginInfo.password]);
			if (invalid)
				return new ServerResponse(invalid)
					.success(false)
					.statusCode(400)
					.respond(res);
			const admin = await LoginAdminUseCase.execute(loginInfo);
			if (typeof admin === 'string' || !admin)
				return new ServerResponse(
					admin || 'Something went wrong while trying to sign you in',
				)
					.success(false)
					.statusCode(400)
					.respond(res);
			const tokens = await CreateAuthTokenUseCase.execute(
				req.ip,
				admin._id.toString(),
				'admin',
			);
			if (typeof tokens === 'string' || !tokens)
				return new ServerResponse(
					tokens || 'Something went wrong while generating tokens',
				)
					.success(false)
					.statusCode(400)
					.respond(res);
			// res.cookie('ACCESS_TOKEN', tokens.newAccessToken.token, {
			// 	maxAge: parseInt(process.env.ACCESS_TOKEN_LIFE as string, 10),
			// });
			// res.cookie('REFRESH_TOKEN', tokens.newRefreshToken.token, {
			// 	maxAge: parseInt(process.env.REFRESH_TOKEN_LIFE as string, 10),
			// });
			new ServerResponse('Login successful')
				.data({
					admin,
					ACCESS_TOKEN: tokens.newAccessToken.token,
					REFRESH_TOKEKN: tokens.newRefreshToken.token,
				})
				.respond(res);
		} catch (err) {
			next(err);
		}
	}

	static createNewAdmin = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const adminData = req.body;
			const admin = await CreateNewAdminUseCase.execute(adminData);
			if (typeof admin === 'string' || !admin) {
				return new ServerResponse(
					admin || 'something went wrong while creating a new admin',
				)
					.success(false)
					.statusCode(400)
					.respond(res);
			}

			new ServerResponse('Admin created successfully').data(admin).respond(res);
		} catch (err) {
			next(err);
		}
	};
}
