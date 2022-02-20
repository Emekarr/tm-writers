import { Request, Response, NextFunction } from 'express';

import LoginAdminUseCase from '../usecases/admin/LoginAdminUseCase';
import CreateAuthTokenUseCase from '../usecases/authentication/CreateAuthTokensUseCase';

// utils
import validate_body from '../utils/validate_body';
import ServerResponse from '../utils/response';

class AdminController {
	login = async (req: Request, res: Response, next: NextFunction) => {
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
			res.cookie('ACCESS_TOKEN', tokens.newAccessToken.token, {
				httpOnly: true,
				maxAge: parseInt(process.env.ACCESS_TOKEN_LIFE as string, 10),
			});
			res.cookie('REFRESH_TOKEN', tokens.newRefreshToken.token, {
				httpOnly: true,
				maxAge: parseInt(process.env.REFRESH_TOKEN_LIFE as string, 10),
			});
			new ServerResponse('Login successful').data(admin).respond(res);
		} catch (err) {
			next(err);
		}
	};
}

export default Object.freeze(new AdminController());
