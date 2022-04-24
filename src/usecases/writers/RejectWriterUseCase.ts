import { IWriterDocument } from '../../db/models/mongodb/writer';
import writer_repository from '../../repository/mongodb/writer_repository';

export default abstract class RejectWriterUseCase {
	private static writer_repository = writer_repository;

	static async execute(writerId: string) {
		const writer = (await this.writer_repository.findById(
			writerId,
		)) as IWriterDocument;
		if (!writer) return 'writer does not exist';
		if (writer.approved_writer) return 'writer already approved';
		if (writer.approved_writer === false) return 'writer already rejected';
		writer.approved_writer = false;
		await this.writer_repository.saveData(writer);
		return true;
	}
}
