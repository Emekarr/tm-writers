import Joi from "joi";
import Otp from "../db/models/redis/otp";

export const validateCacheNewOtp = async (data: object) => {
  return Joi.object({
    code: Joi.number().max(6).min(6).required(),
    contact: Joi.string().required(),
  }).validate(data).value as Otp;
};
