import { decryptData } from '../../utils/hash';
import RedisRepository from '../../repository/redis/redis_repository';

export default abstract class VerifyOtpUseCase {
	private static RedisRepository = RedisRepository;

	static async execute(key: string, code: string) {
		const otp = await this.RedisRepository.findOne(key);
		if (!otp) return 'Otp has expired';
		return await decryptData(code, (otp as any).code);
	}
}
