import { signData } from '../utils/token_generation';
import { decryptData } from '../utils/hash';
import { Types } from 'mongoose';

import AccessToken from '../db/models/redis/access_tokens';
import RefreshToken from '../db/models/redis/refresh_tokens';
import RedisRepository from '../repository/redis/redis_repository';
import { AuthenticationType } from './auth_types';

class Authentication implements AuthenticationType {
	async verifyPassword(password: string, hash: string): Promise<boolean> {
		return await decryptData(password, hash);
	}
	async generateTokens(
		ipAddress: string,
		id: string,
		account: string,
	): Promise<{ newAccessToken: AccessToken; newRefreshToken: RefreshToken }> {
		const newRefreshToken = await this.generateRefreshToken(
			ipAddress,
			id,
			account,
		);
		const newAccessToken = await this.generateAccessToken(
			ipAddress,
			id,
			newRefreshToken.token,
			account,
		);
		return { newAccessToken, newRefreshToken };
	}
	async generateAccessToken(
		ipAddress: string,
		id: string,
		refreshToken: string,
		account: string,
	): Promise<AccessToken> {
		const newAccessToken = new AccessToken(
			refreshToken,
			signData({ id, refreshToken, account }, process.env.JWT_ACCESS_KEY!, {
				expiresIn: process.env.ACCESS_TOKEN_LIFE,
			}),
			ipAddress,
			new Types.ObjectId(id),
		);
		await RedisRepository.createInSet(`${id}-access-tokens`, newAccessToken);
		return newAccessToken;
	}

	async generateRefreshToken(
		ipAddress: string,
		id: string,
		account: string,
	): Promise<RefreshToken> {
		const newRefreshToken = new RefreshToken(
			signData({ id, account }, process.env.JWT_REFRESH_KEY!, {
				expiresIn: process.env.REFRESH_TOKEN_LIFE,
			}),
			ipAddress,
			new Types.ObjectId(id),
		);
		await RedisRepository.createInSet(`${id}-refresh-tokens`, newRefreshToken);
		return newRefreshToken;
	}
}

export default Object.freeze(new Authentication());
