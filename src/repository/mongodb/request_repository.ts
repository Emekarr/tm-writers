import RequestModel from '../../db/models/mongodb/request';

import MongoDbRepository from './mongodb_repository';

class RequestRepository extends MongoDbRepository {
	constructor() {
		super(RequestModel);
	}
}

export default new RequestRepository();
