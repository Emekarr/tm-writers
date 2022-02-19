import redis_repository from "../../repository/redis/redis_repository";

class RedisConnection {
  constructor() {}

  connectToRedis() {
    (async () => await redis_repository.redis.connect())();
  }
}

export default Object.freeze(new RedisConnection());
