import WriterModel, { IWriterDocument, Writer } from '../model/writer';

class WriterService {
	async createWriter(writer_data: Writer): Promise<IWriterDocument | null> {
		let writer!: IWriterDocument | null;
		try {
			writer = await new WriterModel(writer_data).save();
		} catch (err) {
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
}

export default new WriterService();
