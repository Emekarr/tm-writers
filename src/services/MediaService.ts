import cloudinary from 'cloudinary';
import streamifier from 'streamifier';

import upload_repository from '../repository/mongodb/upload_repository';

class MediaService {
	private cld = cloudinary.v2;

	private upload_repository = upload_repository;

	private streamifier = streamifier;

	constructor() {
		this.cld.config({
			cloud_name: process.env.CLOUD_NAME,
			api_key: process.env.API_KEY,
			api_secret: process.env.API_SECRET,
		});
	}

	uploadDataStream(data: Buffer, folder: string, name: string) {
		return new Promise((resolve, reject) => {
			const upload_stream = this.cld.uploader.upload_stream(
				{ folder },
				async (error, result) => {
					if (error) {
						reject(error);
					} else {
						console.log('UPLOAD SUCCESS' + result);
						const upload = await this.upload_repository.createEntry({
							asset_id: (result as any).asset_id,
							url: (result as any).secure_url,
							format: (result as any).format,
							type: (result as any).resource_type,
							name,
						});
						resolve(upload?._id.toString());
					}
				},
			);
			this.streamifier.createReadStream(data).pipe(upload_stream);
		});
	}

	updateData(data: Buffer, folder: string, public_id: string) {
		return new Promise((resolve, reject) => {
			this.cld.uploader.upload_stream(
				{
					folder,
					public_id,
					invalidate: true,
					overwrite: true,
				},
				async (error, result) => {
					if (error) {
						reject(error);
					} else {
						console.log('UPLOAD UPDATE SUCCESS' + result);
						resolve(true);
					}
				},
			);
		});
	}
}

export default new MediaService();
