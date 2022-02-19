import { compare } from 'bcrypt';

import OtpType from '../../interfaces/otp';

export default class Otp implements OtpType {
	constructor(readonly code: string, readonly contact: string) {
		//
	}

	static verify = async (code: string, hashedOtp: string): Promise<boolean> =>
		await compare(code, hashedOtp);
}
