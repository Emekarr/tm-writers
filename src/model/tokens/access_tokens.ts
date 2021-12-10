/* eslint-disable no-useless-constructor */
import { Types } from 'mongoose';

export default class AccessToken {
	constructor(
		readonly refreshToken: string,
		readonly token: string,
		readonly ipAddress: string,
		readonly owner: Types.ObjectId,
	) {
		//
	}
}
