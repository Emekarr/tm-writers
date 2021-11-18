import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcrypt';

import CustomError from '../utils/error';

interface User {
	username: string;
	firstname: string;
	lastname: string;
	mobile: string;
	password?: string;
}

interface IUser extends User {
	profile_image?: Buffer;
	verified_phone: boolean;
	recovery_otp: number;
}

interface IUserDocument extends IUser, Document {
	generateTokens: () => string;
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
	mobile: {
		type: String,
		required: true,
		maxlength: 11,
		minlength: 11,
		trim: true,
		unique: true,
	},
	profile_image: {
		type: Buffer,
		default: null,
	},
	verified_phone: {
		type: Boolean,
		default: false,
	},
	recovery_otp: Number,
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
		this.password = await bcrypt.hash(this.password!, 10);
	}
	next();
});

UserSchema.method('toJSON', function (this: IUserDocument) {
	const user = this.toObject();
	delete user.__v;
	delete user.password;
	return user;
});

export default model<IUserDocument>('User', UserSchema);
