import Joi from "joi";
import {mongoId} from "./customValidation";

export const createRole = {
  body: Joi.object().keys({
    name: Joi.string().trim().min(2).max(66).required(),
    description: Joi.string().min(2).max(666).allow(""),
    permissions: Joi.array().items(Joi.string().custom(mongoId)).unique(),
  }),
};


export default {createRole}