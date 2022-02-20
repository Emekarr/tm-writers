import { validateCreateNewWriter } from '../../validators/writerValidators';
import { Writer, IWriterDocument } from '../../db/models/mongodb/writer';
import writer_repository from '../../repository/mongodb/writer_repository';

export default abstract class CreateNewWriterUseCase {
	private static repo = writer_repository;

	private static validateCreateNewWriter = validateCreateNewWriter;

	static async execute(data: Writer) {
		const writer = this.validateCreateNewWriter(data);
		if (writer.error) return `invalid data provided : ${writer.error}`;
		return (await this.repo.createEntry(
			writer.value,
		)) as IWriterDocument | null;
	}
}
