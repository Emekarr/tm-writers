import WriterRepository from '../../repository/mongodb/writer_repository';
import { IWriterDocument } from '../../db/models/mongodb/writer';
import auth from '../../authentication/auth';

export default abstract class LoginWriterUseCase {
	private static WriterRepository = WriterRepository;

	private static auth = auth;

	static async execute(loginInfo: { email: string; password: string }) {
		const writer = (await this.WriterRepository.findOneByFields({
			email: loginInfo.email,
		})) as IWriterDocument | null;
		if (!writer)
			return `writer does not exist with the email ${loginInfo.email}`;
		const success = await this.auth.verifyPassword(
			loginInfo.password,
			writer.password,
		);
		if (!success) return 'Authentication failed.';
		return writer;
	}
}
