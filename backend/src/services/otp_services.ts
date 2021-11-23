import { Types } from 'mongoose';

import OTP, { OTPDocument } from '../model/otp';

class OtpService {
	generateOtp(): string {
		return Math.floor(100000 + Math.random() * 899999).toString();
	}

	async saveOtp(
		otp: string,
		id: string,
		model: string,
	): Promise<OTPDocument | null> {
		let new_otp!: OTPDocument | null;
		try {
			await OTP.findOneAndDelete({ user: id });
			new_otp = await new OTP({
				otp,
				user: id,
				createdAt: Date.now(),
				model,
			}).save();
		} catch (err) {
			new_otp = null;
		}
		return new_otp;
	}

	async verifyOtp(
		otp: string,
		user: string,
	): Promise<{ match: boolean; otp: OTPDocument | null }> {
		let data: { match: boolean; otp: OTPDocument | null };
		try {
			const current_otp = await this.findOtpByUser(user);
			if (!current_otp) throw new Error('No otp found with that code');
			const is_valid = await current_otp!!.verify(otp);
			if (!is_valid) throw new Error('Invalid otp code');
			data = {
				match: true,
				otp: current_otp,
			};
			await current_otp.delete();
		} catch (err) {
			data = {
				match: false,
				otp: null,
			};
		}
		return data;
	}

	async findOtpByUser(user: string): Promise<OTPDocument | null> {
		let otp!: OTPDocument | null;
		try {
			otp = await OTP.findOne({ user: new Types.ObjectId(user) });
		} catch (err) {
			otp = null;
		}
		return otp;
	}
}

export default new OtpService();
