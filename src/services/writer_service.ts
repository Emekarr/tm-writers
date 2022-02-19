import { compare } from 'bcrypt';

import { IWriter, IWriterDocument, Writer } from '../db/models/mongodb/writer';

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

	async loginWriterWithEmail(
		email: string,
		password: string,
	): Promise<IWriterDocument | null> {
		let writer_data!: IWriterDocument | null;
		try {
			writer_data = await this.findByEmail(email);
			if (!writer_data) throw new Error('No writer returned');
			if (!(await this.loginWriter(writer_data, password)))
				throw new Error('Login failed');
		} catch (err) {
			writer_data = null;
		}
		return writer_data;
	}

	async loginWriterWithUsername(
		username: string,
		password: string,
	): Promise<IWriterDocument | null> {
		let writer_data!: IWriterDocument | null;
		try {
			writer_data = await this.findByUsername(username);
			if (!writer_data) throw new Error('No writer returned');
			if (await this.loginWriter(writer_data, password))
				throw new Error('Login failed');
		} catch (err) {
			writer_data = null;
		}
		return writer_data;
	}

	private async loginWriter(
		writer: IWriterDocument,
		password: string,
	): Promise<boolean> {
		let logged_in!: boolean;
		try {
			logged_in = await compare(password, writer.password!);
		} catch (err) {
			logged_in = false;
		}
		return logged_in;
	}
}

export default new WriterService();
