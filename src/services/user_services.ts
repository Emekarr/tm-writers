import UserModel, { User, IUserDocument, IUser } from '../model/user';

class UserService {
	async createUser(data: User): Promise<IUserDocument | null> {
		let user!: IUserDocument | null;
		try {
			user = await new UserModel(data).save();
		} catch (err) {
			user = null;
		}
		return user;
	}

	async findById(id: string): Promise<IUserDocument | null> {
		let user!: IUserDocument | null;
		try {
			user = await UserModel.findById(id);
		} catch (err) {
			user = null;
		}
		return user;
	}

	async findByUsername(username: string): Promise<IUserDocument | null> {
		let user!: IUserDocument | null;
		try {
			user = await UserModel.findOne({ username });
		} catch (err) {
			user = null;
		}
		return user;
	}

	async findByEmail(email: string): Promise<IUserDocument | null> {
		let user!: IUserDocument | null;
		try {
			user = await UserModel.findOne({ email });
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
