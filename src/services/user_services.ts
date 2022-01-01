import { compare } from 'bcrypt';

import { User, IUserDocument, IUser } from '../db/models/user';

import UserRepository from '../db/mongodb/user_repository';

class UserService {
	async createUser(data: User): Promise<IUserDocument | null> {
		return (await UserRepository.createEntry(data)) as IUserDocument | null;
	}

	async findById(id: string): Promise<IUserDocument | null> {
		return (await UserRepository.findById(id)) as IUserDocument | null;
	}

	async findByUsername(username: string): Promise<IUserDocument | null> {
		return (await UserRepository.findOneByFields({
			username,
		})) as IUserDocument | null;
	}

	async findByEmail(email: string): Promise<IUserDocument | null> {
		return (await UserRepository.findOneByFields({
			email,
		})) as IUserDocument | null;
	}

	async updateUser(id: string, user: IUser): Promise<IUserDocument | null> {
		return (await UserRepository.updateByIdAndReturn(
			id,
			user,
		)) as IUserDocument | null;
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
