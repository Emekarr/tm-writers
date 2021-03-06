import { validateCreateNewUser } from '../../validators/userValidators';
import { User, IUserDocument } from '../../db/models/mongodb/user';
import UserRepository from '../../repository/mongodb/user_repository';
import MediaService from '../../services/MediaService';

export default abstract class CacheUserUseCase {
	private static validateCreateNewUser = validateCreateNewUser;

	private static UserRepository = UserRepository;

	static async execute(data: User) {
		const user = this.validateCreateNewUser(data);
		if (user.error) return `invalid data provided : ${user.error}`;
		// if (user.value.profile_image)
		// 	await MediaService.uploadDataStream(
		// 		user.value.profile_image,
		// 		'profile-images-users',
		// 		`${user.value.email}-profile_image`,
		// 	);
		return (await this.UserRepository.createEntry(
			user.value,
		)) as IUserDocument | null;
	}
}
