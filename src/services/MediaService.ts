import cloudinary from 'cloudinary';

class MediaService {
	private cld = cloudinary.v2;
	constructor() {
		this.cld.config({
			cloud_name: process.env.CLOUD_NAME,
			api_key: process.env.API_KEY,
			api_secret: process.env.API_SECRET,
		});
	}

	uploadDataStream(data: Buffer) {
		return new Promise((resolve, reject) => {
			this.cld.uploader
				.upload_stream({ folder: 'product-images' }, (error, result) => {
					if (error) {
						console.log(error);
					} else {
						console.log('UPLOAD SUCCESS' + result);
						resolve(result?.secure_url!);
					}
				})
				.end(data);
		});
	}
}

export default new MediaService();
