import { Schema, model, Document } from 'mongoose';

export interface Upload {
	name: string;
	format: string;
	url: string;
	type: string;
	asset_id: string;
}

export interface IUploadDocument extends Upload, Document {}

const uploadSchemaFields: Record<keyof Upload, any> = {
	name: {
		type: String,
		required: true,
		trim: true,
	},
	format: {
		type: String,
		required: true,
		trim: true,
	},
	url: {
		type: String,
		required: true,
		trim: true,
	},
	type: {
		type: String,
		required: true,
		trim: true,
	},
	asset_id: {
		type: String,
		required: true,
		trim: true,
	},
};

const UploadSchema = new Schema(uploadSchemaFields, { timestamps: true });

UploadSchema.method('toJSON', function (this: IUploadDocument) {
	const upload = this.toObject() as Partial<IUploadDocument>;
	delete upload.__v;
	return upload;
});

export default model<IUploadDocument>('Upload', UploadSchema);
