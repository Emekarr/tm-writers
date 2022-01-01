import { Schema, model, Document } from 'mongoose';
import { compare, hash } from 'bcrypt';

import CustomError from '../../utils/error';

export interface User {
	username?: string;
	firstname?: string;
	lastname?: string;
	email?: string;
	password?: string;
}

export interface IUser extends User {
	profile_image?: Buffer;
	verified_email?: boolean;
}

export interface IUserDocument extends IUser, Document {
	verifyPassword: (password: string) => Promise<boolean>;
}

const user_schema_field: Record<keyof IUser, any> = {
	username: {
		type: String,
		required: true,
		maxlength: 15,
		minlength: 2,
		trim: true,
		unique: true,
	},
	firstname: {
		type: String,
		required: true,
		maxlength: 15,
		minlength: 2,
		trim: true,
	},
	lastname: {
		type: String,
		required: true,
		maxlength: 15,
		minlength: 2,
		trim: true,
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
	profile_image: {
		type: Buffer,
		default: null,
	},
	verified_email: {
		type: Boolean,
		default: false,
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
};

const UserSchema = new Schema(user_schema_field, { timestamps: true });

UserSchema.pre('save', async function (this: IUserDocument, next) {
	if (this.isModified('password')) {
		this.password = await hash(this.password!, 10);
	}
	next();
});

UserSchema.method('toJSON', function (this: IUserDocument) {
	const user = this.toObject();
	delete user.__v;
	delete user.password;
	return user;
});

UserSchema.method(
	'verifyPassword',
	async function (this: IUserDocument, password: string) {
		return await compare(password, this.password!);
	},
);

export default model<IUserDocument>('User', UserSchema);
