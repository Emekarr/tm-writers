import WriterModel, { IWriter, IWriterDocument, Writer } from '../model/writer';

class WriterService {
	async createWriter(writer_data: Writer): Promise<IWriterDocument | null> {
		let writer!: IWriterDocument | null;
		try {
			writer = await new WriterModel(writer_data).save();
		} catch (err) {
			console.log(err)
			writer = null;
		}
		return writer;
	}

	async findById(id: string): Promise<IWriterDocument | null> {
		let writer: IWriterDocument | null;
		try {
			writer = await WriterModel.findById(id);
		} catch (err) {
			writer = null;
		}
		return writer;
	}

	async updateWriter(
		id: string,
		writer: IWriter,
	): Promise<IWriterDocument | null> {
		let updated_writer!: IWriterDocument | null;
		try {
			updated_writer = await this.findById(id);
			if (!updated_writer) throw new Error('No writer returned');
			updated_writer.update(writer);
			await updated_writer.save();
		} catch (err) {
			updated_writer = null;
		}
		return updated_writer;
	}
}

export default new WriterService();
