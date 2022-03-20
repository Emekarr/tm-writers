import CommentModel from '../../db/models/mongodb/comment';

import MongoDbRepository from './mongodb_repository';

class CommentRepository extends MongoDbRepository {
	constructor() {
		super(CommentModel);
	}
}

export default new CommentRepository();
