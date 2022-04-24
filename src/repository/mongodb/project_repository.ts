import ProjectModel from '../../db/models/mongodb/project';

import MongoDbRepository from './mongodb_repository';

class ProjectRepository extends MongoDbRepository {
	constructor() {
		super(ProjectModel);
	}
}

export default new ProjectRepository();
