import AdminModel from '../../db/models/mongodb/admin';

import MongoDbRepository from './mongodb_repository';

class AdminRepository extends MongoDbRepository {
	constructor() {
		super(AdminModel);
	}
}

export default new AdminRepository();
