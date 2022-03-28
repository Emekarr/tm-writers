import { validateCreateNewUser } from '../../validators/userValidators';
import { User } from '../../db/models/mongodb/user';
import RedisRepository from '../../repository/redis/redis_repository';
import user_repository from '../../repository/mongodb/user_repository';
import writer_repository from '../../repository/mongodb/writer_repository';

export default abstract class CacheUserUseCase {
	private static validateCreateNewUser = validateCreateNewUser;

	private static RedisRepository = RedisRepository;

	private static user_repository = user_repository;

	private static writer_repository = writer_repository;

	static async execute(data: User) {
		const user = this.validateCreateNewUser(data);
		if (user.error) return `invalid data provided : ${user.error}`;
		const existing_user = await this.user_repository.findOneByFields({
			email: user.value.email,
		});
		if (existing_user)
			return `user with email ${user.value.email} already exists`;
		const existing_writer = await this.writer_repository.findOneByFields({
			email: user.value.email,
		});
		if (existing_writer)
			return `writer with email ${user.value.email} already exists`;
		return await this.RedisRepository.createEntryAndExpire(
			`${user.value.email}-user`,
			user.value,
			300,
		);
	}
}
