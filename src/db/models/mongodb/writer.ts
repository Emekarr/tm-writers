import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcrypt';

import CustomError from '../../../utils/error';
import countries from '../../../utils/countries';
import qualification from '../../../utils/qualifications';

export interface Writer {
	username?: string;
	firstname?: string;
	lastname?: string;
	email?: string;
	password?: string;
	country?: string;
	mobile?: string;
	address?: string;
	nearest_landmark?: string;
	highest_qualificaiton?: string;
	experience?: number;
	academic_work?: Buffer;
	strength?: string[];
	weakness?: string[];
}

export interface IWriter extends Writer {
	profile_image?: Buffer;
	verified_email?: boolean;
	verified_mobile?: boolean;
	recovery_otp?: number;
	approved_writer?: boolean;
}

export interface IWriterDocument extends IWriter, Document {
	generateTokens: () => string;
}

const writer_schema_fields: Record<keyof IWriter, any> = {
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
	strength: [
		{
			type: String,
			required: true,
			maxlength: 15,
			minlength: 2,
			trim: true,
		},
	],
	weakness: [
		{
			type: String,
			required: true,
			maxlength: 15,
			minlength: 2,
			trim: true,
		},
	],
	mobile: {
		type: String,
		required: true,
		maxlength: 20,
		minlength: 9,
		trim: true,
		unique: true,
	},
	approved_writer: {
		type: Boolean,
		default: false,
	},
	address: {
		type: String,
		required: true,
		maxlength: 100,
		minlength: 10,
		trim: true,
	},
	highest_qualificaiton: {
		type: String,
		required: true,
		trim: true,
		validate(data: string) {
			if (!qualification.includes(data))
				throw new CustomError('unsupported degree added', 400);
		},
	},
	experience: {
		type: Number,
		required: true,
		trim: true,
	},
	academic_work: {
		type: Buffer,
		// required: true,
	},
	nearest_landmark: {
		type: String,
		required: true,
		maxlength: 50,
		minlength: 2,
		trim: true,
	},
	country: {
		type: String,
		required: true,
		maxlength: 20,
		minlength: 2,
		trim: true,
		validate(data: string) {
			if (!countries.includes(data))
				throw new CustomError('unrecognised country added', 400);
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
	verified_mobile: {
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

const WriterSchema = new Schema(writer_schema_fields, { timestamps: true });

WriterSchema.pre('save', async function (this: IWriterDocument, next) {
	if (this.isModified('password')) {
		this.password = await bcrypt.hash(this.password!, 10);
	}
	next();
});

WriterSchema.method('toJSON', function (this: IWriterDocument) {
	const writer = this.toObject();
	delete writer.__v;
	delete writer.password;
	return writer;
});

export default model<IWriterDocument>('Writer', WriterSchema);
