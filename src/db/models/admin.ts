import { Document, model, Schema } from 'mongoose';
import { hash } from 'bcrypt';

import CustomError from '../../utils/error';

export interface Admin {
	name: string;
	email: string;
	firstname: string;
	lastname: string;
	password?: string;
	phoneNumber: string;
}

export interface IAdminDocument extends Admin, Document {}

const adminSchemaFields: Record<keyof Admin, any> = {
	name: {
		type: String,
		required: true,
		trim: true,
		maxlength: 10,
		minlength: 1,
	},
	email: {
		type: String,
		required: true,
		maxlength: 100,
		trim: true,
		unique: true,
		validate(data: string) {
			const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!regex.test(data))
				throw new CustomError('invalid email provided', 400);
		},
	},
	firstname: {
		type: String,
		required: true,
		trim: true,
		maxlength: 10,
		minlength: 1,
	},
	lastname: {
		type: String,
		required: true,
		trim: true,
		maxlength: 10,
		minlength: 1,
	},
	password: {
		type: String,
		required: true,
		validate(data: string) {
			const regex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
			if (!regex.test(data))
				throw new CustomError('invalid password provided', 400);
		},
	},
	phoneNumber: {
		type: String,
		required: true,
		trim: true,
		maxlength: 13,
		minlength: 1,
	},
};

const AdminSchema = new Schema(adminSchemaFields, {
	timestamps: true,
	capped: {
		size: 1024,
		max: 1,
		autoIndexId: true,
	},
});

AdminSchema.pre('save', async function (this: IAdminDocument, next) {
	if (this.isModified('password')) {
		this.password = await hash(this.password!, 10);
	}
	next();
});

AdminSchema.method('toJSON', function (this: IAdminDocument) {
	const admin = this.toObject();
	delete admin.__v;
	delete admin.password;
	return admin;
});

export default model<IAdminDocument>('Admin', AdminSchema);
