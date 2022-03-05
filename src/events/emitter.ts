import EventEmitter from 'events';

export default abstract class Emitter {
	private static emitter = new EventEmitter();

	static emit(event: string, ...args: any[]) {
		this.emitter.emit(event, args);
	}

	static async listen(event: string, action: (...args: any[]) => void) {
		await this.emitter.on(event, action);
	}
}
