import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

// utils
import ServerResponse from '../../utils/response';
import { verifyData } from '../../utils/token_generation';

// usecases
import redis_repository from '../../repository/redis/redis_repository';
import AccessToken from '../../db/models/redis/access_tokens';

// authentication
import Authentication from '../../authentication/auth';

const generateFromRefresh = async (refreshToken: string, ipAddress: string) => {
	const refreshDecoded = verifyData(
		refreshToken,
		process.env.JWT_REFRESH_KEY!,
		{},
	);
	if (!refreshDecoded) return;

	const refreshTokensFromCache = await redis_repository.findSet(
		`${(refreshDecoded as JwtPayload).id}-refresh-tokens`,
	);

	if (!refreshTokensFromCache || refreshTokensFromCache.length === 0) return;

	const exists = refreshTokensFromCache.find(
		(token: string) =>
			(JSON.parse(token) as AccessToken).token === refreshToken,
	);
	if (!exists) return;

	const { token } = await Authentication.generateAccessToken(
		ipAddress,
		(refreshDecoded as JwtPayload).id,
		refreshToken,
		(refreshDecoded as JwtPayload).account,
	);

	return {
		token,
		id: (refreshDecoded as JwtPayload).id,
		account: (refreshDecoded as JwtPayload).account,
	};
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

		let accessDecoded: JwtPayload | undefined | string;
		let accessToken!: string | void;
		let tokenErr!: any;
		let id!: string;
		let account!: string;
		await jwt.verify(
			accessTokenHeader,
			process.env.JWT_ACCESS_KEY!,
			async (err, decoded) => {
				if (err) {
					tokenErr = err;
					if (err.name === 'TokenExpiredError') {
						const response = await generateFromRefresh(
							refreshTokenHeader,
							req.socket.remoteAddress!,
						);
						accessToken = response?.token;
						id = response?.id;
						account = response?.account;
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
			req.id = id;
			req.account = account;
			return next();
		}

		if (!accessDecoded)
			return new ServerResponse(
				'Auth token not provided. Please sign in again.',
			)
				.statusCode(400)
				.success(false)
				.respond(res);

		const accessTokensFromCache = await redis_repository.findSet(
			`${(accessDecoded as JwtPayload).id}-access-tokens`,
		);

		let cacheAccessToken!: AccessToken;

		if (!accessTokensFromCache || accessTokensFromCache.length === 0) {
			return new ServerResponse('Invalid token used. no tokens available')
				.statusCode(400)
				.respond(res);
		} else {
			const exists = accessTokensFromCache.find(
				(token: string) =>
					(JSON.parse(token) as AccessToken).token === accessTokenHeader,
			);
			if (!exists) {
				return new ServerResponse('Invalid token used. token missing')
					.statusCode(400)
					.respond(res);
			}
			cacheAccessToken = JSON.parse(exists);
		}

		if (req.socket.remoteAddress! !== cacheAccessToken.ipAddress) {
			await redis_repository.deleteFromSet(
				`${(accessDecoded as JwtPayload).id}-access-tokens`,
				[JSON.stringify(cacheAccessToken)],
			);
			return new ServerResponse('token used from unrecognised device.')
				.statusCode(400)
				.success(false)
				.respond(res);
		}
		req.id = (accessDecoded as JwtPayload).id;
		req.account = (accessDecoded as JwtPayload).account;
		next();
	} catch (err) {
		next(err);
	}
};
