import Otp from '../../db/models/redis/otp';
import { validateCacheNewOtp } from '../../validators/otpValidators';
import RedisRepository from '../../repository/redis/redis_repository';

export default abstract class CacheOtpUseCase {
	private static validateCacheNewOtp = validateCacheNewOtp;
	private static Otp = Otp;
	private static redis = RedisRepository;

	static async execute(data: Otp) {
		const otp = await this.validateCacheNewOtp(data);
		const new_otp = new this.Otp(otp.code, otp.contact);
		return await this.redis.createEntryAndExpire(
			`${new_otp.contact}-otp`,
			new_otp,
			300,
		);
	}
}
