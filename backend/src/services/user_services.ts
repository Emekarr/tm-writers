import UserModel, { User, IUserDocument } from '../model/user';

const create_user_service = async (data: User): Promise<IUserDocument> => {
	const new_user = new UserModel(data);
	const user = await new_user.save();
	return user;
};

export default {
	create_user_service,
};
