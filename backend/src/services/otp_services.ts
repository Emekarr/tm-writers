import OTP, { OTPDocument } from '../model/otp';

class OtpService {
	generateOtp(): string {
		return Math.floor(100000 + Math.random() * 899999).toString();
	}

	async saveOtp(otp: string, id: string): Promise<OTPDocument> {
		let new_otp!: OTPDocument;
		try {
			await OTP.findOneAndDelete({ user: id });
			new_otp = await new OTP({
				otp,
				user: id,
				createdAt: Date.now(),
			}).save();
		} catch (err) {
			console.log(err);
		}

		return new_otp;
	}
}

export default new OtpService();
