import AccessToken from '../db/models/redis/access_tokens';
import RefreshToken from '../db/models/redis/refresh_tokens';

export interface AuthenticationType {
	verifyPassword(password: string, hash: string): Promise<boolean>;
	generateTokens(
		ipAddress: string,
		id: string,
		account: string,
	): Promise<{
		newAccessToken: AccessToken;
		newRefreshToken: RefreshToken;
	}>;
	generateAccessToken(
		ipAddress: string,
		id: string,
		refreshToken: string,
		account: string,
	): Promise<AccessToken>;
	generateRefreshToken(
		ipAddress: string,
		id: string,
		account: string,
	): Promise<RefreshToken>;
}
