import UserModel from '../models/user';

import MongoDbRepository from './mongodb_repository';

class UserRepository extends MongoDbRepository {
	constructor() {
		super(UserModel);
	}
}

export default new UserRepository();
