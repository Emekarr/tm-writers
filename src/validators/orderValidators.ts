import Joi from 'joi';
import { IOrder, Order } from '../db/models/mongodb/order';

export const validateCreateNewOrder = (data: Order) =>
	Joi.object({
		services: Joi.array().items(Joi.string().min(2).max(30)),
		message: Joi.string().max(2000).min(2).required(),
		timeline: Joi.string().required(),
		number: Joi.number().min(1).max(99).required(),
		name: Joi.string().required(),
		attachment: Joi.string().uri(),
		createdBy: Joi.string().required(),
		uniqueId: Joi.string().required(),
	}).validate(data);

export const validateUpdateOrder = (data: Partial<IOrder>) =>
	Joi.object({
		services: Joi.array().items(Joi.string().min(2).max(30)),
		message: Joi.string().max(2000).min(2),
		timeline: Joi.string(),
		number: Joi.number().min(1).max(99),
		name: Joi.string(),
		state: Joi.string(),
	}).validate(data);
