import { Document, model, Schema, Types, PaginateModel } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export interface Notification {
	heading: string;
	body: string;
	reciever: string;
}

export interface NotificationDocument extends Notification, Document {}

const notificationSchemaFields: Record<keyof Notification, any> = {
	heading: {
		type: String,
		required: true,
	},
	body: {
		type: String,
		required: true,
	},
	reciever: {
		type: Types.ObjectId,
		required: true,
	},
};

const NotificationSchema = new Schema(notificationSchemaFields, {
	timestamps: true,
});

NotificationSchema.plugin(mongoosePaginate);

NotificationSchema.method('toJSON', function (this: NotificationDocument) {
	const order = this.toObject();
	delete order.__v;
	return order;
});

export default model<NotificationDocument, PaginateModel<NotificationDocument>>(
	'Notification',
	NotificationSchema,
);
