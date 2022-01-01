export default interface CachingRepository {
	createEntry(key: string, payload: any): Promise<any>;
	createEntryAndExpire(
		key: string,
		payload: any,
		expireIn: number,
	): Promise<any>;
	createInSet(key: string, payload: any): Promise<any>;
	createFixedLengthSet(
		key: string,
		payload: any,
		maxLength: number,
	): Promise<any>;
	// find
	findSet(key: string): Promise<any>;
	findOne(key: string): Promise<any>;
	findOneAndDelete(key: string): Promise<any>;
	// update
	updateOne(key: string, payload: any): Promise<any>;
	updateSet(key: string, payload: any): Promise<any>;
	updateFixedLengthSet(
		key: string,
		payload: any,
		maxLength: number,
	): Promise<any>;
	// delete
	deleteOne(key: string): Promise<any>;
	__truncate(): void;
}
