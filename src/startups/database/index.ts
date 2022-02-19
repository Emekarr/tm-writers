import mongodb from "./mongodb";
import redis from './redis'

export default () => {
  // connect to mongodb
  mongodb.connect();
  redis.connectToRedis()
};
