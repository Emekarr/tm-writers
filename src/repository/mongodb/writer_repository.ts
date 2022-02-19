import WriterModel from '../../db/models/mongodb/writer';

import MongoDbRepository from './mongodb_repository';

class WriterRepository extends MongoDbRepository {
	constructor() {
		super(WriterModel);
	}
}

export default new WriterRepository();
