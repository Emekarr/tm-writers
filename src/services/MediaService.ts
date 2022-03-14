import cloudinary from 'cloudinary';

import upload_repository from '../repository/mongodb/upload_repository';

class MediaService {
	private cld = cloudinary.v2;

	private upload_repository = upload_repository;

	constructor() {
		this.cld.config({
			cloud_name: process.env.CLOUD_NAME,
			api_key: process.env.API_KEY,
			api_secret: process.env.API_SECRET,
		});
	}

	uploadDataStream(data: Buffer, folder: string, name: string) {
		return new Promise((resolve, reject) => {
			this.cld.uploader
				.upload_stream({ folder }, async (error, result) => {
					if (error) {
						console.log(error);
					} else {
						console.log('UPLOAD SUCCESS' + result);
						const upload = await this.upload_repository.createEntry({
							asset_id: (result as any).asset_id,
							url: (result as any).secure_url,
							format: (result as any).format,
							type: (result as any).resource_type,
							name,
						});
						resolve(upload?._id);
					}
				})
				.end(data);
		});
	}
}

export default new MediaService();
