const { z } = require("zod");

const signupSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters"),

  email: z
    .string()
    .email("Please provide a valid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
  email: z
    .string()
    .email("Please provide a valid email address"),

  password: z
    .string()
    .min(1, "Password is required"),
});

module.exports = { signupSchema, loginSchema };