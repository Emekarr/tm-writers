import { Model, QueryOptions, Document, Query } from 'mongoose';

import Repository from '../interfaces/repository';

import { PaginateOptions } from '../interfaces/repo_types';
import user from '../models/user';

export default abstract class MongoDbRepository implements Repository {
	constructor(private model: Model<any>) {}

	// used to ensure that filter options works properly
	private __cleanFilterOptions(filter: object): object {
		Object.keys(filter).forEach((item) => {
			!(filter as any)[item] && delete (filter as any)[item];
			if (item === 'id') {
				(filter as any)._id = (filter as any).id;
				delete (filter as any)['id'];
			}
		});
		return filter;
	}

	// used to populate a mongoose query
	private async __populateQuery(
		query: Query<any, any>,
		populateKeys: string[] = [],
	): Promise<Document> {
		populateKeys.forEach(async (key) => {
			await query.populate(key);
		});
		return await query;
	}

	// used to populate a mongoose documents
	private async __populateDocument(
		doc: Document,
		populateKeys: string[],
	): Promise<Document> {
		populateKeys.forEach(async (key) => await doc.populate(key));
		return doc;
	}

	// used to paginate databse requests
	private async __paginate(
		query: Query<any, any>,
		paginate: PaginateOptions = { limit: 10, page: 1 },
		populateKeys: string[] = [],
	): Promise<Document[]> {
		const limit = paginate.limit === 0 ? 5 : paginate.limit;
		const page = paginate.page === 0 ? 5 : paginate.page;
		const docs: Document[] = await query.limit(limit).skip((page - 1) * limit);
		return await Promise.all(
			docs.map(async (doc) => {
				const test = await this.__populateDocument(doc, populateKeys);
				return test;
			}),
		);
	}

	async findLast(): Promise<Document<any> | null> {
		return ((await this.model.find().limit(-1)) as Document<any>[])[0];
	}

	async createEntry(payload: any): Promise<Document<any> | null> {
		let result!: Document<any> | null;
		try {
			result = await new this.model(payload).save();
		} catch (err) {
			result = null;
		}
		return result;
	}

	async findById(
		id: string,
		populateKeys?: string[],
	): Promise<Document<any> | null> {
		let result!: Document<any> | null;
		try {
			result = await this.__populateQuery(
				this.model.findById(id),
				populateKeys,
			);
		} catch (err) {
			result = null;
		}
		return result;
	}

	async findManyByFields(
		filter: object,
		paginate?: PaginateOptions,
		populateKeys?: string[],
	): Promise<Document[]> {
		let results!: Document[];
		try {
			results = await this.__paginate(
				this.model.find(this.__cleanFilterOptions(filter)),
				paginate,
				populateKeys,
			);
		} catch (err) {
			results = [];
		}
		return results;
	}

	async findOneByFields(filter: object, populateKeys?: string[]): Promise<any> {
		let result!: Document<any> | null;
		try {
			result = await this.__populateQuery(
				this.model.findOne(this.__cleanFilterOptions(filter)),
				populateKeys,
			);
		} catch (err) {
			result = null;
		}
		return result;
	}

	async findAll(
		paginate?: PaginateOptions,
		populateKeys?: string[],
	): Promise<Document[]> {
		let results: Document[];
		try {
			results = await this.__paginate(
				this.model.find(),
				paginate,
				populateKeys,
			);
		} catch (err) {
			results = [];
		}
		return results;
	}

	async updateById(id: string, payload: object): Promise<boolean> {
		let success!: boolean;
		try {
			await this.model.findByIdAndUpdate(id, payload, {}, (err, doc, res) => {
				if (!doc) throw new Error('Document not found');
				success = true;
			});
		} catch (err) {
			success = false;
		}
		return success;
	}

	async updateByIdAndReturn(
		id: string,
		payload: object,
	): Promise<Document | null> {
		let result!: Document | null;
		try {
			await this.model.findByIdAndUpdate(id, payload, {}, (err, doc, res) => {
				if (!doc) throw new Error('Document not found');
				result = doc;
			});
		} catch (err) {
			result = null;
		}
		return result;
	}
	async updateByFields(filter: object, payload: object): Promise<boolean> {
		let success!: boolean;
		try {
			await this.model.findOneAndUpdate(
				filter,
				payload,
				{},
				(err, doc, res) => {
					if (!doc) throw new Error('Document not found');
					success = true;
				},
			);
		} catch (err) {
			success = false;
		}
		return success;
	}
	async updateByFieldsAndReturn(
		filter: object,
		payload: object,
	): Promise<Document | null> {
		let result!: Document | null;
		try {
			await this.model.findOneAndUpdate(
				filter,
				payload,
				{},
				(err, doc, res) => {
					if (!doc) throw new Error('Document not found');
					result = doc;
				},
			);
		} catch (err) {
			result = null;
		}
		return result;
	}

	async deleteMany(filter: object): Promise<boolean> {
		let success: boolean;
		try {
			await this.model.deleteMany(filter, {}, (err) => {
				if (err) throw new Error(err.message);
			});
			success = true;
		} catch (err) {
			success = false;
		}
		return success;
	}

	async deleteById(id: string): Promise<boolean> {
		let success!: boolean;
		try {
			await this.model.findByIdAndDelete(id, {}, (err, doc, res) => {
				if (!doc) throw new Error('Document not found');
			});
			success = true;
		} catch (err) {
			success = false;
		}
		return success;
	}

	async saveData(payload: Document): Promise<boolean> {
		let success!: boolean;
		try {
			const savedDoc = await payload.save();
			if (!savedDoc) throw new Error('Failed to save doc');
			success = true;
		} catch (err) {
			success = false;
		}
		return success;
	}

	__truncate(condition: object) {
		if (process.env.NODE_ENV === 'DEV') {
			this.model.deleteMany(condition);
		}
	}
}
