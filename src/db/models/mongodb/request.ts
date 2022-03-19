import { Schema, Document, model, Types } from 'mongoose';

export interface Request {
	accepted: Types.ObjectId;
	writers: Types.ObjectId[];
	order: Types.ObjectId;
}

export interface RequestDocument extends Document, Request {}

const requestSchemaFields: Record<keyof Request, any> = {
	accepted: {
		type: Types.ObjectId,
		ref: 'Writer',
	},
	writers: [
		{
			type: Types.ObjectId,
			ref: 'Writer',
			required: true,
		},
	],
	order: {
		type: Types.ObjectId,
		ref: 'Order',
		required: true,
		unique: true,
	},
};

const RequestSchema = new Schema(requestSchemaFields, { timestamps: true });

export default model<RequestDocument>('Request', RequestSchema);
