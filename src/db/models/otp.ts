import { compare } from 'bcrypt';

import OtpType from '../interfaces/otp';

export default class Otp implements OtpType {
	constructor(readonly code: string, readonly email: string) {
		//
	}
}

export const verify = async (
	code: string,
	hashedOtp: string,
): Promise<boolean> => await compare(code, hashedOtp);
