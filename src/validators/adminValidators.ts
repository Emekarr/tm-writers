import joi from 'joi';
import JoiPassword from 'joi-password-complexity';
import { Admin } from '../db/models/mongodb/admin';

export const validateNewAdminData = (data: Admin) =>
	joi
		.object({
			name: joi.string().required(),
			email: joi.string().email().required(),
			firstname: joi.string().required(),
			lastname: joi.string().required(),
			password: JoiPassword(
				{
					min: 7,
					max: 30,
					lowerCase: 1,
					upperCase: 1,
					numeric: 1,
					symbol: 1,
				},
				'Password',
			),
		})
		.validate(data);
