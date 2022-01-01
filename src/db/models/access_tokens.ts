/* eslint-disable no-useless-constructor */
import { Types } from 'mongoose';

import AccessTokenType from '../interfaces/access_tokens';

export default class AccessToken implements AccessTokenType {
	constructor(
		readonly refreshToken: string,
		readonly token: string,
		readonly ipAddress: string,
		readonly owner: Types.ObjectId,
	) {
		//
	}
}
