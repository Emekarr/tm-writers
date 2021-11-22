import UserModel, { User, IUserDocument, IUser } from '../model/user';

class UserService {
	async createUser(data: User): Promise<IUserDocument | null> {
		let user!: IUserDocument | null;
		try {
			const new_user = new UserModel(data);
			user = await new_user.save();
		} catch (err) {
			user = null;
		}
		return user;
	}

	async findById(id: string): Promise<IUserDocument | null> {
		console.log(id)
		let user!: IUserDocument | null;
		try {
			user = await UserModel.findById(id);
			console.log(user)
		} catch (err) {
			user = null;
		}
		return user;
	}

	async updateUser(id: string, user: IUser): Promise<IUserDocument | null> {
		let updated_user!: IUserDocument | null;
		try {
			updated_user = await this.findById(id);
			if (!updated_user) throw new Error('No user returned');
			updated_user.update(user);
			await updated_user.save();
		} catch (err) {
			updated_user = null;
		}
		return updated_user;
	}
}

export default new UserService();
