import Joi from 'joi';
import { Request } from '../db/models/mongodb/request';

export const validateCreateRequest = (data: Request) =>
	Joi.object({
		writers: Joi.array().items(Joi.string().required()).required(),
		order: Joi.string().required(),
	}).validate(data);
