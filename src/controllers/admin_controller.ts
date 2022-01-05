import { Request, Response, NextFunction } from 'express';

import QueryService from '../services/query_service';
import TokenService from '../services/token_service';

import AdminService from '../services/admin_service';

import ServerResponseBuilder from '../utils/response';

class AdminController {
	login = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { password } = req.body;
			QueryService.checkIfNull([password]);
			let admin = await AdminService.loginAdmin(password);
			if (!admin)
				return new ServerResponseBuilder('Login attempt failed')
					.success(false)
					.statusCode(400)
					.respond(res);
			const { newAccessToken, newRefreshToken } =
				await TokenService.generateToken(req.socket.remoteAddress!, admin!._id);
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
			new ServerResponseBuilder('Login attepmt successful')
				.data(admin)
				.respond(res);
		} catch (err) {
			next(err);
		}
	};
}

export default Object.freeze(new AdminController());
