export default () => {
	// start up the databases
	import('./database').then((db) => {
		db.default();
	});
	import('./seeder').then((seeder) => {
		seeder.default();
	});
};
