import { validateCreateNewWriter } from '../../validators/writerValidators';
import { Writer, IWriterDocument } from '../../db/models/mongodb/writer';
import writer_repository from '../../repository/mongodb/writer_repository';
import MediaService from '../../services/MediaService';

export default abstract class CreateNewWriterUseCase {
	private static repo = writer_repository;

	private static validateCreateNewWriter = validateCreateNewWriter;

	static async execute(data: Writer) {
		const writer = this.validateCreateNewWriter(data);
		if (writer.error) return `invalid data provided : ${writer.error}`;
		writer.value.cv = await MediaService.uploadDataStream(
			Buffer.from(writer.value.cv),
			'writers cv',
			`${writer.value.email}-cv`,
		);
		writer.value.highest_qualification = await MediaService.uploadDataStream(
			Buffer.from(writer.value.highest_qualification),
			'writers highest_qualification',
			`${writer.value.email}-highest_qualification`,
		);
		if (writer.value.profile_image)
			writer.value.profile_image = await MediaService.uploadDataStream(
				Buffer.from(writer.value.profile_image),
				'profile_image_writers',
				`${writer.value.email}-profile_image`,
			);
		return (await this.repo.createEntry(
			writer.value,
		)) as IWriterDocument | null;
	}
}
