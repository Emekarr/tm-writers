import Joi from 'joi';
import JoiPassword from 'joi-password-complexity';
import { User } from '../db/models/mongodb/user';

export const validateCreateNewUser = (data: User) =>
	Joi.object({
		username: Joi.string().max(30).min(2).required(),
		firstname: Joi.string().max(30).min(2).required(),
		lastname: Joi.string().max(30).min(2).required(),
		email: Joi.string().email().required(),
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
		profile_image: Joi.string().uri(),
		verified_email: Joi.boolean(),
	}).validate(data);

export const validateUpdateUser = (data: User) =>
	Joi.object({
		username: Joi.string().max(30).min(2),
		firstname: Joi.string().max(30).min(2),
		lastname: Joi.string().max(30).min(2),
		email: Joi.string().email(),
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
		profile_image: Joi.string().uri(),
	}).validate(data);