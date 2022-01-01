export default interface Messenger {
	send(...args: any[]): Promise<boolean>;
}
