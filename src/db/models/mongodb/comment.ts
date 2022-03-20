import { Schema, Document, model, Types } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export interface Comment {
	name: string;
	order: Types.ObjectId;
	comment: string;
	profile_image: Types.ObjectId;
}

export interface CommentDocument extends Comment, Document {}

const commentSchemaFields: Record<keyof Comment, any> = {
	name: {
		type: String,
		required: true,
		enum: ['you', 'admin'],
	},
	order: {
		type: Types.ObjectId,
		required: true,
		ref: 'Order',
	},
	comment: {
		type: String,
		required: true,
		maxlength: 500,
	},
	profile_image: {
		type: Types.ObjectId,
		ref: 'Upload',
	},
};

const CommentSchema = new Schema(commentSchemaFields, { timestamps: true });

CommentSchema.plugin(mongoosePaginate);

CommentSchema.method('toJSON', function (this: CommentDocument) {
	const order = this.toObject();
	delete order.__v;
	return order;
});

export default model<CommentDocument>('Comment', CommentSchema);
