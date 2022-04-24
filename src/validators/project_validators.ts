import Joi from 'joi';
import { Project } from '../db/models/mongodb/project';

export const validateCreateNewProject = (data: Project) => {
	return Joi.object({
		title: Joi.string().required(),
		body: Joi.string().required(),
		order: Joi.string().required(),
		writer: Joi.string().required(),
	}).validate(data);
};

export const validateUpdateNewProject = (data: Partial<Project>) => {
	return Joi.object({
		title: Joi.string(),
		body: Joi.string(),
	}).validate(data);
};
