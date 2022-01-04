import AdminModel from '../models/admin';

import MongoDbRepository from './mongodb_repository';

class AdminRepository extends MongoDbRepository {
	constructor() {
		super(AdminModel);
	}
}

export default new AdminRepository();
