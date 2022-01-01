import redis_repository from './redis_repository';

class RedisConnection {
	constructor() {}

	connectToRedis(): RedisConnection {
		(async () => await redis_repository.redis.connect())();
		return this;
	}
}

export default Object.freeze(new RedisConnection());
