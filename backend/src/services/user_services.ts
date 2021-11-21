import UserModel, { User, IUserDocument } from '../model/user';

class UserService {
	async create_user(data: User): Promise<IUserDocument> {
		let user!: IUserDocument;
		try {
			const new_user = new UserModel(data);
			user = await new_user.save();
		} catch (err) {
			console.log(err);
		}

		return user;
	}
}

export default new UserService();
