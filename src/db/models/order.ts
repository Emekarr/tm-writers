import { Document, model, Schema, Types } from 'mongoose';

export interface Order {
	services: string[];
	message: string;
	timeline: string;
	number: number;
}

export interface IOrder extends Order {
	name: string;
	uniqueId: string;
	state: string;
	orderNumber: number;
	assignedTo: string;
}

export interface IOrderDocument extends IOrder, Document {}

const orderSchemaFields: Record<keyof IOrder, any> = {
	number: {
		type: Number,
		required: true,
		max: 99,
		min: 1,
		trim: true,
		default: 1,
	},
	assignedTo: {
		type: Types.ObjectId,
		default: null,
		ref: 'Writer',
	},
	name: {
		type: String,
		required: true,
		maxlength: 50,
		minlength: 2,
		trim: true,
		unique: true,
	},
	uniqueId: {
		type: String,
		required: true,
		trim: true,
		unique: true,
	},
	state: {
		type: String,
		default: 'PENDING',
		validate(data: string) {
			if (data !== 'PENDING' && data !== 'FINISHED')
				throw new Error(`Unsupported Order state ${data} used.`);
		},
	},
	orderNumber: {
		type: Number,
		required: true,
		unique: true,
	},
	services: [
		{
			type: String,
			required: true,
			maxlength: 30,
			minlength: 2,
			trim: true,
		},
	],
	message: {
		type: String,
		required: true,
		maxlength: 1000,
		minlength: 2,
		trim: true,
		unique: true,
	},
	timeline: {
		type: String,
		required: true,
		trim: true,
	},
};

const OrderSchema = new Schema(orderSchemaFields);

OrderSchema.method('toJSON', function (this: IOrderDocument) {
	const order = this.toObject();
	delete order.__v;
	return order;
});

export default model<IOrderDocument>('Order', OrderSchema);
