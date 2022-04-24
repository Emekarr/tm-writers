import WriterRepository from '../../repository/mongodb/writer_repository';
import {  Writer } from '../../db/models/mongodb/writer';
import { validateUpdateWriter } from '../../validators/writerValidators';

export default abstract class UpdateWriterUseCase {
	private static WriterRepository = WriterRepository;

	private static validateUpdateWriter = validateUpdateWriter;

	static async execute(data: Partial<Writer>, writer: string) {
		const update = this.validateUpdateWriter(data);
		if (update.error) return update.error.message || 'new writer data invalid';
		return this.WriterRepository.updateById(writer, update.value);
	}
}
