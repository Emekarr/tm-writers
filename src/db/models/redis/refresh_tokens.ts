import { Types } from 'mongoose';

import RefreshTokenType from '../../interfaces/refresh_token';

export default class RefreshToken implements RefreshTokenType {
	constructor(
		readonly token: string,
		readonly ipAddress: string,
		readonly owner: Types.ObjectId,
	) {
		//
	}
}
