import { Document, model, Schema, Types, PaginateModel } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export interface Order {
	services: string[];
	message: string;
	timeline: string;
	number: number;
	name: string;
	createdBy: string;
	uniqueId: string;
	attachment: string;
	orderNumber: number;
}

export interface IOrder extends Order {
	state: string;
	assignedTo: string;
}

export interface IOrderDocument extends IOrder, Document {}

const orderSchemaFields: Record<keyof IOrder, any> = {
	createdBy: {
		type: Types.ObjectId,
		required: true,
		ref: 'User',
	},
	attachment: {
		type: Types.ObjectId,
		ref: 'Upload',
	},
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
	},
	orderNumber: {
		type: Number,
		required: true,
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
		maxlength: 2000,
		minlength: 2,
		trim: true,
	},
	timeline: {
		type: String,
		required: true,
		trim: true,
	},
};

const OrderSchema = new Schema(orderSchemaFields, { timestamps: true });

OrderSchema.plugin(mongoosePaginate);

OrderSchema.method('toJSON', function (this: IOrderDocument) {
	const order = this.toObject();
	delete order.__v;
	return order;
});

export default model<IOrderDocument, PaginateModel<IOrderDocument>>(
	'Order',
	OrderSchema,
);
