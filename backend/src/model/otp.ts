import { Schema, Document, model, Types } from 'mongoose';
import { hash, compare } from 'bcrypt';

export interface IOTP {
	otp: string;
	user: Types.ObjectId;
	createdAt: string;
}

export interface OTPDocument extends Document, IOTP {
	verify: (otp: string) => Promise<boolean>;
}

const otp_schema_fields: Record<keyof IOTP, any> = {
	user: {
		type: Types.ObjectId,
		ref: 'Student',
		required: true,
	},
	otp: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
		expires: '5m',
	},
};

const OTPSchema = new Schema<OTPDocument>(otp_schema_fields, {
	timestamps: true,
});

OTPSchema.pre('save', async function (this: OTPDocument, next) {
	if (this.isModified('otp')) {
		this.otp = await hash(this.otp, 10);
	}
	next();
});

OTPSchema.method(
	'verify',
	async function (this: OTPDocument, otp: string): Promise<boolean> {
		return await compare(otp, this.otp);
	},
);

export default model<OTPDocument>('OTP', OTPSchema);
