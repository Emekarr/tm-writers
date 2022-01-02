import { compare } from 'bcrypt';

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

	async loginWriterWithEmail(email: string, password: string) {
		let logged_in!: IWriterDocument | null;
		try {
			const writer = await this.findByEmail(email);
			if (!writer) throw new Error('No writer returned');
			logged_in = await this.loginWriter(writer, password);
		} catch (err) {
			logged_in = null;
		}
		return logged_in;
	}

	async loginWriterWithUsername(username: string, password: string) {
		let logged_in!: IWriterDocument | null;
		try {
			const writer = await this.findByUsername(username);
			if (!writer) throw new Error('No writer returned');
			logged_in = await this.loginWriter(writer, password);
		} catch (err) {
			logged_in = null;
		}
		return logged_in;
	}

	private async loginWriter(
		writer: IWriterDocument,
		password: string,
	): Promise<IWriterDocument | null> {
		let logged_in!: IWriterDocument | null;
		try {
			const correct_password = await compare(password, writer.password!);
			if (!correct_password) throw new Error('Login failed');
			logged_in = writer;
		} catch (err) {
			logged_in = null;
		}
		return logged_in;
	}
}

export default new WriterService();
