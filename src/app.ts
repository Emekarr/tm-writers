import express, { Application, Response, Request } from 'express';

// utils
import ServerResponse from './utils/response';

// middleware
import error_middleware from './middleware/error_middleware';

// routes
import router from './routes';

// connect to databases
import('./db/mongodb/connect');
import('./db/redis/connect').then((redisConnection) => {
	redisConnection.default.connectToRedis();
});

class App {
	private express: Application;

	constructor() {
		this.express = express();

		this.express.use(express.json());
		this.express.use(express.urlencoded({ extended: true }));

		this.express.use('/api', router);

		this.express.use('/howfar', (req: Request, res: Response) => {
			new ServerResponse('i dey boss').respond(res);
		});

		this.express.use('*', (req: Request, res: Response) => {
			new ServerResponse(`the route ${req.originalUrl} does not exist.`)
				.success(false)
				.statusCode(404)
				.respond(res);
		});

		this.express.use(error_middleware);
	}

	listen(port: string, cb: () => void) {
		this.express.listen(port, cb);
	}
}

export default new App();
