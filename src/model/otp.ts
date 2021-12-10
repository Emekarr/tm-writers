import { compare } from 'bcrypt';

export default class Otp {
	constructor(readonly code: string, readonly email: string) {
		//
	}
}

export const verify = async (
	code: string,
	hashedOtp: string,
): Promise<boolean> => await compare(code, hashedOtp);
