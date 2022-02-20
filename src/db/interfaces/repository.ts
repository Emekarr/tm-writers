import { PaginateOptions } from './repo_types';

export default interface Repository {
	// create data
	createEntry(payload: any, ...args: any[]): Promise<any>;
	// find data
	findById(id: string, populateKeys?: string[], ...args: any[]): Promise<any>;
	findManyByFields(
		filter: object,
		paginate?: PaginateOptions,
		populateKeys?: string[],
		...args: any[]
	): Promise<any[]>;
	findOneByFields(
		filter: object,
		populateKeys?: string[],
		...args: any[]
	): Promise<any>;
	findAll(
		paginate?: PaginateOptions,
		populateKeys?: string[],
		...args: any[]
	): Promise<any[]>;
	findLast(filter: object): Promise<any>;
	// update data
	updateById(id: string, payload: object, ...args: any[]): Promise<any>;
	updateByIdAndReturn(
		id: string,
		payload: object,
		...args: any[]
	): Promise<any>;
	updateByFields(filter: object, payload: object, ...args: any[]): Promise<any>;
	updateByFieldsAndReturn(
		filter: object,
		payload: object,
		...args: any[]
	): Promise<any>;
	// delete data
	deleteMany(filter: object, ...args: any[]): Promise<any>;
	deleteById(id: string, ...args: any[]): Promise<any>;
	// save data
	saveData(payload: any): Promise<any>;
	// truncate
	__truncate(condition: object, ...args: any[]): void;

	// transactions
	startTransaction(sesison: any, job: () => Promise<any>): Promise<any>;
	startSession(): Promise<any>;
}
