import AccessToken from '../db/models/redis/access_tokens';
import RefreshToken from '../db/models/refresh_tokens';

export interface AuthenticationType {
	verifyPassword(password: string): Promise<boolean>;
	generateTokens(
		ipAddress: string,
		id: string,
	): Promise<{
		newAccessToken: AccessToken;
		newRefreshToken: RefreshToken;
	}>;
	generateAccessToken(
		ipAddress: string,
		id: string,
		refreshToken: string,
	): Promise<AccessToken>;
	generateRefreshToken(ipAddress: string, id: string): Promise<RefreshToken>;
}
