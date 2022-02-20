import { Document, model, Schema } from 'mongoose';
import { hashData } from '../../../utils/hash';

export interface Admin {
	name: string;
	email: string;
	firstname: string;
	lastname: string;
	password: string;
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
		this.password = await hashData(this.password!);
	}
	next();
});

AdminSchema.method('toJSON', function (this: IAdminDocument) {
	const admin = this.toObject() as Partial<IAdminDocument>;
	delete admin.__v;
	delete admin.password;
	return admin;
});

export default model<IAdminDocument>('Admin', AdminSchema);
