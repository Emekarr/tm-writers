import { validateCreateNewWriter } from '../../validators/writerValidators';
import { Writer } from '../../db/models/mongodb/writer';
import RedisRepository from '../../repository/redis/redis_repository';
import user_repository from '../../repository/mongodb/user_repository';
import writer_repository from '../../repository/mongodb/writer_repository';

export default abstract class CacheWriterUseCase {
	private static validateCreateNewWriter = validateCreateNewWriter;

	private static RedisRepository = RedisRepository;

	private static user_repository = user_repository;

	private static writer_repository = writer_repository;

	static async execute(data: Writer) {
		const writer = this.validateCreateNewWriter(data);
		const existing_user = await this.user_repository.findOneByFields({
			email: writer.value.email,
		});
		if (existing_user)
			return `user with email ${writer.value.email} already exists`;
		const existing_writer = await this.writer_repository.findOneByFields({
			email: writer.value.email,
		});
		if (existing_writer)
			return `writer with email ${writer.value.email} already exists`;
		if (writer.error) return `invalid data provided : ${writer.error}`;
		return await this.RedisRepository.createEntryAndExpire(
			`${writer.value.email}-writer`,
			writer.value,
			300,
		);
	}
}
