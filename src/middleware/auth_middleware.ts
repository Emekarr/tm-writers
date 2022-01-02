import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

// utils
import ServerResponse from '../utils/response';

// services
import RedisService from '../services/redis_service';
import TokenService from '../services/token_service';
import AccessToken from '../db/models/access_tokens';

const generateFromRefresh = async (
	refreshToken: string,
	ipAddress: string,
): Promise<string | void> => {
	let refreshDecoded: JwtPayload | undefined;
	jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY!, (err, decoded) => {
		refreshDecoded = decoded;
	});

	if (!refreshDecoded) return;

	const { token } = await TokenService.generateAccessToken(
		ipAddress,
		refreshDecoded!.id,
		refreshToken,
	);

	return token;
};

export default async (req: Request, res: Response, next: NextFunction) => {
	try {
		const accessTokenHeader = req.headers.authorizationaccesstoken as string;
		const refreshTokenHeader = req.headers.authorizationrefreshtoken as string;
		if (!refreshTokenHeader || refreshTokenHeader === ' ')
			return new ServerResponse('Tokens not provided')
				.statusCode(400)
				.success(false)
				.respond(res);

		let accessDecoded: JwtPayload | undefined;
		let accessToken!: string | void;
		let tokenErr!: any;
		await jwt.verify(
			accessTokenHeader,
			process.env.JWT_ACCESS_KEY!,
			async (err, decoded) => {
				if (err) {
					tokenErr = err;
					if (err.name === 'TokenExpiredError') {
						accessToken = await generateFromRefresh(
							refreshTokenHeader,
							req.socket.remoteAddress!,
						);
					}
				}
				accessDecoded = decoded;
			},
		);

		if (tokenErr) {
			if (!accessToken) {
				return new ServerResponse(
					'Could not generate auth token. Please sign in again.',
				)
					.statusCode(400)
					.success(false)
					.respond(res);
			}

			res.cookie('ACCESS_TOKEN', accessToken, {
				httpOnly: true,
				maxAge: parseInt(process.env.ACCESS_TOKEN_LIFE as string, 10),
			});
			return next();
		}

		if (!accessDecoded)
			return new ServerResponse(
				'Auth token not provided. Please sign in again.',
			)
				.statusCode(400)
				.success(false)
				.respond(res);

		const accessTokensFromCache = await RedisService.getAccessTokens(
			accessDecoded.id,
		);
		let cacheAccessToken!: AccessToken;

		if (!accessTokensFromCache || accessTokensFromCache.length === 0) {
			return new ServerResponse('Invalid token used')
				.statusCode(400)
				.respond(res);
		} else {
			const exists = accessTokensFromCache.filter(
				(token) =>
					(JSON.parse(token) as AccessToken).token === accessTokenHeader,
			);
			if (exists.length !== 1) {
				return new ServerResponse('Invalid token used')
					.statusCode(400)
					.respond(res);
			}
			cacheAccessToken = JSON.parse(exists[0]);
		}

		if (req.socket.remoteAddress! !== cacheAccessToken.ipAddress) {
			await RedisService.deleteAccessToken(accessDecoded.id, [
				JSON.stringify(cacheAccessToken),
			]);
			return new ServerResponse('token used from unrecognised device.')
				.statusCode(400)
				.success(false)
				.respond(res);
		}
		req.id = accessDecoded.id;
		next();
	} catch (err) {
		next(err);
	}
};
