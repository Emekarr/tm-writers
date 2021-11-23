import { Request, Response, NextFunction } from 'express';

// services
import OtpService from '../services/otp_services';
import MessagingService from '../services/messaging_service';
import QueryService from '../services/query_service';
import UserService from '../services/user_services';
import WriterService from '../services/writer_service';

// utils
import CustomError from '../utils/error';
import ServerResponse from '../utils/response';

// models
import { IUserDocument } from '../model/user';
import { IWriterDocument } from '../model/writer';

const request_otp = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id } = req.query;
		const { email, model } = req.body;
		QueryService.checkIfNull([id, email]);
		const otp = OtpService.generateOtp();
		const saved_otp = await OtpService.saveOtp(
			otp,
			id as string,
			model as string,
		);
		if (!saved_otp) throw new CustomError('Failed to create new otp', 400);
		if (process.env.NODE_ENV === 'TEST' || process.env.NODE_ENV === 'DEV') {
			new ServerResponse('otp sent successfully').data({ otp }).respond(res);
		} else if (process.env.NODE_ENV === 'PROD') {
			const { success } = await MessagingService.sendEmail(
				email as string,
				otp,
			);
			if (!success) throw new CustomError('Failed to send otp', 400);
			new ServerResponse('otp sent successfully').respond(res);
		} else {
			throw new CustomError('unknown environment running', 500);
		}
	} catch (err) {
		next(err);
	}
};

const verify_otp = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { otp_code, user } = req.body;
		QueryService.checkIfNull([otp_code, user]);
		const { match, otp } = await OtpService.verifyOtp(otp_code, user);
		if (!match || !otp) throw new CustomError('otp validation failed', 400);
		if (otp.model === 'user') {
			const account = await UserService.findById(otp.user.toString()!!);
			if (!account) throw new CustomError('otp validation failed', 400);
			const updated_account = await UserService.updateUser(account._id!!, {
				verified_email: false,
			});
			if (!updated_account) throw new CustomError('otp validation failed', 400);
		} else if (otp.model === 'writer') {
			const account = await WriterService.findById(otp.user.toString()!!);
			if (!account) throw new CustomError('otp validation failed', 400);
			const updated_account = await WriterService.updateUser(account._id!!, {
				verified_email: false,
			});
			if (!updated_account) throw new CustomError('otp validation failed', 400);
		}
		new ServerResponse('Account email verified').respond(res);
	} catch (err) {
		next(err);
	}
};

export default {
	request_otp,
	verify_otp,
};
