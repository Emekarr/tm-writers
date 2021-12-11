import { compare } from 'bcrypt';

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

	async loginUserWithEmail(email: string, password: string) {
		let logged_in!: IUserDocument | null;
		try {
			const user = await this.findByEmail(email);
			if (!user) throw new Error('No user returned');
			logged_in = await this.loginUser(user, password);
		} catch (err) {
			logged_in = null;
		}
		return logged_in;
	}

	async loginUserWithUsername(username: string, password: string) {
		let logged_in!: IUserDocument | null;
		try {
			const user = await this.findByUsername(username);
			if (!user) throw new Error('No user returned');
			logged_in = await this.loginUser(user, password);
		} catch (err) {
			logged_in = null;
		}
		return logged_in;
	}

	private async loginUser(
		user: IUserDocument,
		password: string,
	): Promise<IUserDocument | null> {
		let logged_in!: IUserDocument | null;
		try {
			const correct_password = await compare(password, user.password!);
			if (correct_password) {
				logged_in = user;
			} else {
				logged_in = null;
			}
		} catch (err) {
			logged_in = null;
		}
		return logged_in;
	}
}

export default new UserService();
