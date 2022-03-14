import UploadModel from '../../db/models/mongodb/upload';

import MongoDbRepository from './mongodb_repository';

class UploadRepository extends MongoDbRepository {
	constructor() {
		super(UploadModel);
	}
}

export default new UploadRepository();
