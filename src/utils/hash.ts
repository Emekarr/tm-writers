import { hash, compare } from 'bcrypt';

export const hashData = (data: string) => {
	return hash(data, 7);
};

export const decryptData = (data: string, encrypted: string) => {
	return compare(data, encrypted);
};
