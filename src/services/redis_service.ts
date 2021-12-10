import { createClient } from 'redis';

import { User } from '../model/user';
import Otp from '../model/otp';
import AccessToken from '../model/tokens/access_tokens';
import RefreshToken from '../model/tokens/refresh_tokens';
import { Writer } from '../model/writer';

class RedisService {
	private redis;

	constructor() {
		this.redis = createClient({ url: process.env.REDIS_URL as string });
		this.redis.on('error', (err) => console.log('Redis Client Error', err));
	}

	connectToRedis(): RedisService {
		(async () => await this.redis.connect())();
		return this;
	}

	async cacheOtp(otp: Otp): Promise<boolean> {
		let success!: boolean;
		try {
			const result = await this.redis.SET(
				`${otp.email}-otp`,
				JSON.stringify(otp),
			);
			if (result === 'OK') {
				success = true;
				this.redis.EXPIRE(`${otp.email}-otp`, 300);
			} else {
				success = false;
			}
		} catch (err) {
			success = false;
		}
		return success;
	}

	async getOtp(email: string): Promise<Otp | null> {
		let otp!: Otp | null;
		try {
			const data = await this.redis.GET(`${email}-otp`);
			if (!data) return null;
			otp = JSON.parse(data);
		} catch (err) {
			otp = null;
		}
		return otp;
	}

	async cacheUser(user: User): Promise<boolean> {
		let success!: boolean;
		try {
			const existing_user = await this.redis.GET(`${user.email}-user`);
			if (existing_user) return false;
			const result = await this.redis.SET(
				`${user.email}-user`,
				JSON.stringify(user),
			);
			if (result === 'OK') {
				success = true;
				this.redis.EXPIRE(`${user.email}-user`, 300);
			} else {
				success = false;
			}
		} catch (err) {
			success = false;
		}
		return success;
	}

	async getUser(email: string): Promise<User | null> {
		let user!: User | null;
		try {
			const data = await this.redis.GET(`${email}-user`);
			if (!data) return null;
			user = JSON.parse(data);
		} catch (err) {
			user = null;
		}
		return user;
	}

	async cacheWriter(writer: Writer): Promise<boolean> {
		let success!: boolean;
		try {
			const existing_writer = await this.redis.GET(`${writer.email}-writer`);
			if (existing_writer) return false;
			const result = await this.redis.SET(
				`${writer.email}-writer`,
				JSON.stringify(writer),
			);
			if (result === 'OK') {
				success = true;
				this.redis.EXPIRE(`${writer.email}-writer`, 300);
			} else {
				success = false;
			}
		} catch (err) {
			success = false;
		}
		return success;
	}

	async getWriter(email: string): Promise<User | null> {
		let writer!: Writer | null;
		try {
			const data = await this.redis.GET(`${email}-writer`);
			if (!data) return null;
			writer = JSON.parse(data);
		} catch (err) {
			writer = null;
		}
		return writer;
	}

	async cacheRefreshTokens(id: string, token: RefreshToken): Promise<boolean> {
		let success;
		try {
			const count = await this.redis.SCARD(`${id}-refresh-tokens`);
			if (count >= 10) {
				const allTokens = await this.redis.SMEMBERS(`${id}-refresh-tokens`);
				await this.redis.SREM(`${id}-refresh-tokens`, allTokens[0]);
			}
			await this.redis.SADD(`${id}-refresh-tokens`, JSON.stringify(token));
			success = true;
		} catch (err) {
			success = false;
		}
		return success;
	}

	async cacheAccessTokens(id: string, token: AccessToken): Promise<boolean> {
		let success;
		try {
			const count = await this.redis.SCARD(`${id}-access-tokens`);
			if (count >= 10) {
				const allTokens = await this.redis.SMEMBERS(`${id}-access-tokens`);
				await this.redis.SREM(`${id}-access-tokens`, allTokens[0]);
			}
			await this.redis.SADD(`${id}-access-tokens`, JSON.stringify(token));
			success = true;
		} catch (err) {
			success = false;
		}
		return success;
	}
}

export default new RedisService().connectToRedis();
