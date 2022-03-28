import Joi from 'joi';
import JoiPassword from 'joi-password-complexity';
import { User } from '../db/models/mongodb/user';

export const validateCreateNewUser = (data: User) =>
	Joi.object({
		username: Joi.string().max(30).min(2).required(),
		firstname: Joi.string().max(30).min(2).required(),
		lastname: Joi.string().max(30).min(2).required(),
		email: Joi.string().email().required(),
		dob: Joi.date().required(),
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
		profile_image: Joi.any(),
		verified_email: Joi.boolean(),
	}).validate(data);

export const validateUpdateUser = (data: Partial<User>) =>
	Joi.object({
		username: Joi.string().max(30).min(2),
		firstname: Joi.string().max(30).min(2),
		lastname: Joi.string().max(30).min(2),
		dob: Joi.date(),
		email: Joi.string().email(),
		bio: Joi.string(),
		gender: Joi.string().valid('M', 'F'),
		profile_image: Joi.any(),
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
	}).validate(data);
