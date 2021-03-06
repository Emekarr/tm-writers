import express, { Application, Response, Request } from 'express';
import os from 'os';
import cors from 'cors';

import cookie_parser from 'cookie-parser';

// utils
import ServerResponse from './utils/response';

// middleware
import error_middleware from './middleware/error_middleware';

// routes
import router from './routes';

// start ups
import('./startups/index').then((startup) => startup.default());

class App {
	private express: Application;

	constructor() {
		this.express = express();

		this.express.use(
			cors({
				origin: ['http://localhost:3000', process.env.CLIENT_URL as string],
				credentials: true,
			}),
		);

		this.express.use(cookie_parser());

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
