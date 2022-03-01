import BaseJoi, { ValidationResult } from 'joi';
import JoiCountry from '@pixul/joi-country';
import JoiPassword from 'joi-password-complexity';
import JoiMobile from 'joi-phone-number';
import { Writer } from '../db/models/mongodb/writer';

const Joi = BaseJoi.extend(JoiCountry, JoiMobile);

export const validateCreateNewWriter = (data: Writer) =>
	Joi.object({
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
		country: Joi.string().country().required(),
		mobile: Joi.string().phoneNumber(),
		profile_image: Joi.string().uri(),
		address: Joi.string().max(100).min(10).required(),
		nearest_landmark: Joi.string().max(50).min(2).required(),
		highest_qualificaiton: Joi.string()
			.valid('high school diploma', 'MSc', 'BSc', 'Masters', 'Doctorate')

			.required(),
		experience: Joi.number().required(),
		academic_work: Joi.string().uri().required(),
		strength: Joi.array().items(Joi.string()),
		weakness: Joi.array().items(Joi.string()),
	}).validate(data) as ValidationResult;

export const validateUpdateWriter = (data: Writer) =>
	Joi.object({
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
		country: Joi.string().country(),
		mobile: Joi.string().phoneNumber(),
		profile_image: Joi.string().uri(),
		address: Joi.string().max(100).min(10),
		nearest_landmark: Joi.string().max(50).min(2),
		highest_qualificaiton: Joi.string().valid(
			'high school diploma',
			'MSc',
			'BSc',
			'Masters',
			'Doctorate',
		),
		experience: Joi.number(),
		academic_work: Joi.string().uri(),
		strength: Joi.array().items(Joi.string()),
		weakness: Joi.array().items(Joi.string()),
	}).validate(data) as ValidationResult;
