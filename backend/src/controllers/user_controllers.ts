import { Request, Response, NextFunction } from 'express';

// services
import UserServices from '../services/user_services';
import OtpService from '../services/otp_services';
import MessagingService from '../services/messaging_service';
import QueryService from '../services/query_service';

// models
import { User } from '../model/user';

// utils
import CustomError from '../utils/error';
import ServerResponse from '../utils/response';

const create_user = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user_data: User = req.body;
		QueryService.checkIfNull([user_data]);
		const user = await UserServices.createUser(user_data);
		if (!user) throw new CustomError('Failed to create new user', 400);
		new ServerResponse('User created successfully').data(user).respond(res);
	} catch (err) {
		next(err);
	}
};

const request_otp = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id } = req.query;
		const { email } = req.body;
		QueryService.checkIfNull([id, email]);
		const otp = OtpService.generateOtp();
		const saved_otp = OtpService.saveOtp(otp, id as string);
		if (!saved_otp) throw new CustomError('Failed to create new otp', 400);
		const { success } = await MessagingService.sendEmail(email as string, otp);
		if (!success) throw new CustomError('Failed to send otp', 400);
		new ServerResponse('otp sent successfully').respond(res);
	} catch (err) {
		next(err);
	}
};

const verify_otp = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { otp_code } = req.body;
		QueryService.checkIfNull([otp_code]);
		const { match, otp } = await OtpService.verifyOtp(otp_code);
		if (!match || !otp) throw new CustomError('otp validation failed', 400);
		const user = await UserServices.findById(otp.user.toString()!!);
		if (!user) throw new CustomError('otp validation failed', 400);
		user.verified_email = true;
		const updated_user = await UserServices.updateUser(user._id!!, {
			verified_email: false,
		});
		if (!updated_user) throw new CustomError('otp validation failed', 400);
		new ServerResponse('User verified').respond(res);
	} catch (err) {
		next(err);
	}
};

export default {
	create_user,
	request_otp,
	verify_otp,
};
