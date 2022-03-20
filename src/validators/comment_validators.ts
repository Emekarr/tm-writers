import Joi from 'joi';
import { Comment } from '../db/models/mongodb/comment';

export const validateCreateNewComment = (data: Comment) =>
	Joi.object({
		name: Joi.string().required().valid('admin', 'you'),
		order: Joi.string().required(),
		author: Joi.string().required(),
		comment: Joi.string().required(),
		profile_image: Joi.string(),
	}).validate(data);
