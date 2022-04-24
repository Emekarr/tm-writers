import { Schema, Document, model, Types } from 'mongoose';

export interface Project {
	title: string;
	body: string;
	order: string;
	writer: string;
}

export interface IProject extends Project {
	finished: boolean;
}

export interface IProjectDocumemt extends IProject, Document {}

const projectSchemaFields: Record<keyof IProject, any> = {
	finished: {
		type: Boolean,
		default: false,
	},
	title: {
		type: String,
		required: true,
	},
	body: {
		type: String,
		required: true,
	},
	order: {
		type: Types.ObjectId,
		required: true,
		ref: 'Order',
	},
	writer: {
		type: Types.ObjectId,
		required: true,
		ref: 'Writer',
	},
};

const ProjectSchema = new Schema(projectSchemaFields, { timestamps: true });

ProjectSchema.method('toJSON', function (this: IProjectDocumemt) {
	const order = this.toObject();
	delete order.__v;
	return order;
});

export default model<IProjectDocumemt>('Project', ProjectSchema);
