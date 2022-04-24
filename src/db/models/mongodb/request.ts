import { Schema, Document, model, Types } from 'mongoose';

export interface Request {
	accepted: Types.ObjectId;
	writers: { writer: Types.ObjectId; accepted: boolean }[];
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
			writer: {
				type: Types.ObjectId,
				ref: 'Writer',
				required: true,
			},
			accepted: Boolean,
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
