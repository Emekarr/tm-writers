import { createClient } from 'redis';

import RedisRepository from '../db/redis/redis_repository';

import { User } from '../db/models/user';
import Otp from '../db/models/otp';
import AccessToken from '../db/models/access_tokens';
import RefreshToken from '../db/models/refresh_tokens';
import { Writer } from '../db/models/writer';

class RedisService {
	private redis = RedisRepository;

	async cacheOtp(otp: Otp): Promise<boolean> {
		return await this.redis.createEntryAndExpire(`${otp.email}-otp`, otp, 300);
	}

	async getOtp(email: string): Promise<Otp | null> {
		return (await this.redis.findOne(`${email}-otp`)) as Otp | null;
	}

	async cacheUser(user: User): Promise<boolean> {
		let success!: boolean;
		try {
			const existing_user = await this.redis.findOne(`${user.email}-user`);
			if (existing_user) throw new Error('User already cached');
			success = await this.redis.createEntryAndExpire(
				`${user.email}-user`,
				JSON.stringify(user),
				300,
			);
		} catch (err) {
			success = false;
		}
		return success;
	}

	async getUser(email: string): Promise<User | null> {
		return (await this.redis.findOne(`${email}-user`)) as User | null;
	}

	async cacheWriter(writer: Writer): Promise<boolean> {
		return await this.redis.createEntryAndExpire(
			`${writer.email}-writer`,
			writer,
			300,
		);
	}

	async getWriter(email: string): Promise<User | null> {
		return (await this.redis.findOne(`${email}-writer`)) as User | null;
	}

	async cacheRefreshTokens(id: string, token: RefreshToken): Promise<boolean> {
		return this.redis.createInSet(`${id}-refresh-tokens`, token);
	}

	async getRefreshToken(id: string): Promise<RefreshToken | null> {
		return (await this.redis.findOne(
			`${id}-refresh-tokens`,
		)) as RefreshToken | null;
	}

	async cacheAccessTokens(id: string, token: AccessToken): Promise<boolean> {
		return this.redis.createInSet(`${id}-access-tokens`, token);
	}

	async getAccessToken(id: string): Promise<AccessToken | null> {
		return (await this.redis.findOne(
			`${id}-access-tokens`,
		)) as AccessToken | null;
	}
}

export default Object.freeze(new RedisService());
