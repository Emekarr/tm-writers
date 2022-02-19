import UserModel from '../../db/models/mongodb/user';

import MongoDbRepository from './mongodb_repository';

class UserRepository extends MongoDbRepository {
	constructor() {
		super(UserModel);
	}
}

export default new UserRepository();
