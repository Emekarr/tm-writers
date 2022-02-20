import { isIP } from 'net';

import auth from '../../authentication/auth';
import RedisRepository from '../../repository/redis/redis_repository';

export default abstract class CreateAuthTokenUseCase {
	private static auth = auth;
	private static RedisRepository = RedisRepository;

	static async execute(ipAddress: string, id: string, account: string) {
		if (!isIP(ipAddress)) return 'Invalid ipAddress';
		const tokens = await this.auth.generateTokens(ipAddress, id, account);
		await this.RedisRepository.updateFixedLengthSet(
			`${id}-access-tokens`,
			tokens.newAccessToken,
			10,
		);
		await this.RedisRepository.updateFixedLengthSet(
			`${id}-refresh-tokens`,
			tokens.newRefreshToken,
			10,
		);
		return tokens;
	}
}
