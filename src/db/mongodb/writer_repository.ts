import WriterModel from '../models/writer';

import MongoDbRepository from './mongodb_repository';

class WriterRepository extends MongoDbRepository {
	constructor() {
		super(WriterModel);
	}
}

export default new WriterRepository();
