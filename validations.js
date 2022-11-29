import { body } from "express-validator";

export const registerValidation = [
  body("fullName").isLength({ min: 3 }),
  body("email").isEmail(),
  body("password").isLength({ min: 5 }),
  body("avatarUrl").isObject(),
];

export const loginValidation = [
  body("email").isEmail(),
  body("password").isLength({ min: 5 }),
];

export const testCreateValidation = [
  body("title").isLength({ min: 3 }).isString(),
  body("text").isLength({ min: 5 }).isString(),
  body("category").optional().isString(),
  body("backgroundImage").isURL(),
  body("ques").isArray(),
];
