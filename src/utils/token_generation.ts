import { sign, verify } from 'jsonwebtoken';

export const signData = (payload: object, key: string, opts: object) =>
	sign(payload, key, opts);

export const verifyData = (payload: string, key: string, opts: object) =>
	verify(payload, key, opts);
