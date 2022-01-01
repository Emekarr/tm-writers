import AccessToken from '../db/models/access_tokens';
import RefreshToken from '../db/models/refresh_tokens';

import Authentication from '../authentication/auth';

class TokenService {
	async generateToken(
		ipAddress: string,
		id: string,
	): Promise<{
		newAccessToken: AccessToken;
		newRefreshToken: RefreshToken;
	}> {
		return await Authentication.generateTokens(ipAddress, id);
	}

	async generateRefreshToken(
		ipAddress: string,
		id: string,
	): Promise<RefreshToken> {
		return Authentication.generateRefreshToken(ipAddress, id);
	}

	async generateAccessToken(
		ipAddress: string,
		id: string,
		refreshToken: string,
	): Promise<AccessToken> {
		return Authentication.generateAccessToken(ipAddress, id, refreshToken);
	}
}

export default new TokenService();
