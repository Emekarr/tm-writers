import { hash } from 'bcrypt';

// services
import RedisService from './redis_service';

// models
import Otp, { verify } from '../db/models/otp';


class OtpService {
	generateOtp(): string {
		return Math.floor(100000 + Math.random() * 899999).toString();
	}

	async saveOtp(code: string, email: string): Promise<Otp | null> {
		let newOtp!: Otp | null;
		try {
			const hashedCode = await hash(code, 10);
			newOtp = new Otp(hashedCode, email);
		} catch (err) {
			newOtp = null;
		}
		return newOtp;
	}

	async verifyOtp(
		otp: string,
		email: string,
	): Promise<{
		match: boolean;
	}> {
		let data: {
			match: boolean;
		};
		try {
			const currentOtp = await this.findOtpByEmail(email);
			if (!currentOtp) throw new Error('No otp found with that code');
			const isValid = await verify(otp, currentOtp.code);
			if (!isValid) throw new Error('Invalid otp code');
			data = {
				match: true,
			};
		} catch (err) {
			data = {
				match: false,
			};
		}
		return data;
	}

	async findOtpByEmail(email: string): Promise<Otp | null> {
		let otp!: Otp | null;
		try {
			otp = await RedisService.getOtp(email);
		} catch (err) {
			otp = null;
		}
		return otp;
	}
}

export default new OtpService();
