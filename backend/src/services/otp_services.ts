import { OutputFileType } from 'typescript';
import OTP, { OTPDocument } from '../model/otp';

class OtpService {
	generateOtp(): string {
		return Math.floor(100000 + Math.random() * 899999).toString();
	}

	async saveOtp(otp: string, id: string): Promise<OTPDocument | null> {
		let new_otp!: OTPDocument | null;
		try {
			await OTP.findOneAndDelete({ user: id });
			new_otp = await new OTP({
				otp,
				user: id,
				createdAt: Date.now(),
			}).save();
		} catch (err) {
			new_otp = null;
		}
		return new_otp;
	}

	async verifyOtp(
		otp: string,
	): Promise<{ match: boolean; otp: OTPDocument | null }> {
		let data: { match: boolean; otp: OTPDocument | null };
		try {
			const current_otp = await this.findOtpByCode(otp);
			if (!current_otp) throw new Error('No otp found with that code');
			const is_valid = await current_otp!!.verify(otp);
			if (!is_valid) throw new Error('Invalid otp code');
			data = {
				match: true,
				otp: current_otp,
			};
		} catch (err) {
			data = {
				match: false,
				otp: null,
			};
		}
		return data;
	}

	async findOtpByCode(code: string): Promise<OTPDocument | null> {
		let otp!: OTPDocument | null;
		try {
			otp = await OTP.findOne({ code });
		} catch (err) {
			otp = null;
		}
		return otp;
	}
}

export default new OtpService();
