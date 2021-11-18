import express, { Application, Response, Request } from 'express';

import ServerResponse from './utils/response';

class App {
	private express: Application;

	constructor() {
		this.express = express();

		this.express.use('/howfar', (req: Request, res: Response) => {
			new ServerResponse('i dey boss').respond(res);
		});

		this.express.use('*', (req: Request, res: Response) => {
			new ServerResponse(`the route ${req.originalUrl} does not exist.`)
				.success(false)
				.statusCode(404)
				.respond(res);
		});
	}

	listen(port: string, cb: () => void) {
		this.express.listen(port, cb);
	}
}

export default new App();
