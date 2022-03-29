import cluster from 'cluster';
import os from 'os';

import App from '../app';

const cpuCount = os.cpus().length;
if (cluster.isPrimary) {
	for (let i = 0; i < cpuCount; i++) {
		cluster.fork();
	}
} else {
	App.listen(process.env.PORT as string, () => {
		console.log(
			`SERVER IS UP AND RUNNING ON PORT : ${process.env.PORT} -----WORKER ${process.pid}`,
		);
	});
}

// listen to dead worker thread
cluster.on('exit', (worker, code, signal) => {
	console.log(`${worker.process.pid} has been killed.`);
	cluster.fork();
});
