import { Document, model, Schema, PaginateModel } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { hashData } from '../../../utils/hash';

export interface User {
	username: string;
	firstname: string;
	lastname: string;
	email: string;
	password: string;
	dob: number;
	about: string;
}

export interface IUser extends User {
	profile_image: string;
	verified_email: boolean;
	orders: number;
	bio: string;
	gender: string;
}

export interface IUserDocument extends IUser, Document {}

const user_schema_field: Record<keyof IUser, any> = {
	username: {
		type: String,
		required: true,
		maxlength: 30,
		minlength: 2,
		trim: true,
		unique: true,
	},
	bio: {
		type: String,
		trim: true,
	},
	gender: {
		type: String,
		default: 'N/A',
	},
	about: {
		type: String,
	},
	dob: {
		type: Number,
		required: true,
	},
	orders: {
		type: Number,
		default: 0,
	},
	firstname: {
		type: String,
		required: true,
		maxlength: 30,
		minlength: 2,
		trim: true,
	},
	lastname: {
		type: String,
		required: true,
		maxlength: 30,
		minlength: 2,
		trim: true,
	},
	email: {
		type: String,
		required: true,
		maxlength: 100,
		trim: true,
		unique: true,
	},
	profile_image: {
		type: String,
		default: null,
	},
	verified_email: {
		type: Boolean,
		default: false,
	},
	password: {
		type: String,
		required: true,
	},
};

const UserSchema = new Schema(user_schema_field, { timestamps: true });

UserSchema.plugin(mongoosePaginate);

UserSchema.pre('save', async function (this: IUserDocument, next) {
	if (this.isModified('password')) {
		this.password = await hashData(this.password);
	}
	next();
});

UserSchema.method('toJSON', function (this: IUserDocument) {
	const user = this.toObject() as Partial<IUserDocument>;
	delete user.__v;
	delete user.password;
	return user;
});

export default model<IUserDocument, PaginateModel<IUserDocument>>(
	'User',
	UserSchema,
);
