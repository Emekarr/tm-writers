import WriterRepository from '../../repository/mongodb/writer_repository';
import { IWriterDocument } from '../../db/models/mongodb/writer';
import auth from '../../authentication/auth';
import { validateUpdateWriter } from '../../validators/writerValidators';

export default abstract class UpdateWriterPasswordUseCase {
	private static WriterRepository = WriterRepository;

	private static auth = auth;

	private static validateUpdateWriter = validateUpdateWriter;

	static async execute(loginInfo: {
		id: string;
		password: string;
		new_password: string;
	}) {
		const response = this.validateUpdateWriter({
			password: loginInfo.new_password,
		});
		if (response.error)
			return response.error.message || 'new password not valid';
		const writer = (await this.WriterRepository.findById(
			loginInfo.id,
		)) as IWriterDocument | null;
		if (!writer) return `writer does not exist`;
		const success = await this.auth.verifyPassword(
			loginInfo.password,
			writer.password,
		);
		if (!success) return 'Authentication failed.';
		writer.password = response.value.password;
		return await this.WriterRepository.saveData(writer);
	}
}
