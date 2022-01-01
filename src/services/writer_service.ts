import { IWriter, IWriterDocument, Writer } from '../db/models/writer';

import WriterRepository from '../db/mongodb/writer_repository';

class WriterService {
	async createWriter(writer_data: Writer): Promise<IWriterDocument | null> {
		return (await WriterRepository.createEntry(
			writer_data,
		)) as IWriterDocument | null;
	}

	async findById(id: string): Promise<IWriterDocument | null> {
		return (await WriterRepository.findById(id)) as IWriterDocument | null;
	}

	async findByUsername(username: string): Promise<IWriterDocument | null> {
		return (await WriterRepository.findOneByFields({
			username,
		})) as IWriterDocument | null;
	}

	async findByEmail(email: string): Promise<IWriterDocument | null> {
		return (await WriterRepository.findOneByFields({
			email,
		})) as IWriterDocument | null;
	}

	async updateWriter(
		id: string,
		writer: IWriter,
	): Promise<IWriterDocument | null> {
		return (await WriterRepository.updateByIdAndReturn(
			id,
			writer,
		)) as IWriterDocument | null;
	}
}

export default new WriterService();
