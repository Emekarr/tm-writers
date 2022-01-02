import { createClient } from 'redis';

import CachingRepo from '../interfaces/caching_repo';

class RedisRepository implements Partial<CachingRepo> {
	public redis;

	constructor() {
		this.redis = createClient({ url: process.env.REDIS_URL as string });
		this.redis.on('error', (err) => console.log('Redis Client Error', err));
	}

	async createEntry(key: string, payload: any): Promise<boolean> {
		let success!: boolean;
		try {
			const result = await this.redis.SET(key, JSON.stringify(payload));
			if (result !== 'OK') throw new Error('Caching failed.');
			success = true;
		} catch (err) {
			success = false;
		}
		return success;
	}

	async createEntryAndExpire(
		key: string,
		payload: any,
		expireIn: number,
	): Promise<boolean> {
		let success!: boolean;
		try {
			const result = await this.redis.SET(key, JSON.stringify(payload));
			if (result !== 'OK') throw new Error('Caching failed.');
			this.redis.EXPIRE(key, expireIn);
			success = true;
		} catch (err) {
			success = false;
		}
		return success;
	}

	async createInSet(key: string, payload: any): Promise<boolean> {
		let success!: boolean;
		try {
			this.redis.ZADD(key, {
				score: Date.now(),
				value: JSON.stringify(payload),
			});
			success = true;
		} catch (err) {
			success = false;
		}
		return success;
	}

	async findSet(key: string): Promise<string[]> {
		let result!: string[];
		try {
			result = await this.redis.ZRANGE(key, 0, -1);
			if (!result) throw new Error('Set not found');
		} catch (err) {
			result = [];
		}
		return result;
	}

	async updateSet(key: string, payload: any): Promise<boolean> {
		let success!: boolean;
		try {
			this.redis.ZADD(key, {
				score: Date.now(),
				value: JSON.stringify(payload),
			});
			success = true;
		} catch (err) {
			success = false;
		}
		return success;
	}

	async updateFixedLengthSet(
		key: string,
		payload: any,
		maxLength: number,
	): Promise<boolean> {
		let success!: boolean;
		try {
			const setSize = await this.redis.ZCARD(key);
			if (setSize >= maxLength) {
				await this.redis.ZREMRANGEBYSCORE(key, -Infinity, setSize - maxLength);
			}
			this.redis.ZADD(key, {
				score: Date.now(),
				value: JSON.stringify(payload),
			});
			success = true;
		} catch (err) {
			success = false;
		}
		return success;
	}

	async findOne(key: string): Promise<string | null> {
		let result!: string | null;
		try {
			const data = await this.redis.GET(key);
			if (!data) throw new Error('Could not retrieve data');
			result = JSON.parse(data);
		} catch (err) {
			result = null;
		}
		return result;
	}

	async findOneAndDelete(key: string): Promise<boolean> {
		let result!: boolean;
		try {
			const data = await this.redis.GET(key);
			if (!data) throw new Error('Could not retrieve data');
			const deleted = await this.redis.DEL(key);
			if (deleted !== 1) throw new Error('Deletion failed');
			result = JSON.parse(data);
		} catch (err) {
			result = false;
		}
		return result;
	}

	async updateOne(key: string, payload: string): Promise<boolean> {
		let success!: boolean;
		try {
			const result = await this.redis.SET(key, payload);
			if (!result) throw new Error('Update failed');
			success = true;
		} catch (err) {
			success = false;
		}
		return success;
	}

	async deleteOne(key: string): Promise<boolean> {
		let success!: boolean;
		try {
			const deleted = await this.redis.DEL(key);
			if (deleted !== 1) throw new Error('Deletion failed');
			success = true;
		} catch (err) {
			success = false;
		}
		return success;
	}

	async deleteFromSet(key: string, payload: string[]): Promise<boolean> {
		let success!: boolean;
		try {
			await this.redis.ZREM(key, payload);
		} catch (err) {
			success = false;
		}
		return success;
	}
	__truncate(): void {
		this.redis.FLUSHDB();
	}
}

export default Object.freeze(new RedisRepository());
