import GenUniqueId from 'generate-unique-id';
interface options {
	length: number;
	useLetters: boolean;
	useNumbers: boolean;
	includeSymbols: string[];
	excludeSymbols: string[];
}
export default (opts: Partial<options>) => GenUniqueId(opts);
