import RefreshToken from './refresh_token';

export default interface AccessTokenType extends RefreshToken {
	refreshToken: string;
}
