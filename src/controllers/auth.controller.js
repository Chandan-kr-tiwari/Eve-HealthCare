const { ZodError } = require("zod");
const { signupSchema, loginSchema } = require("../validators/auth.validator");
const authService = require("../services/auth.service");

async function signUp(req, res) {
  try {
    const data = signupSchema.parse(req.body);

    const result = await authService.signup(data);

    return res.status(201).json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: error.issues[0].message,
      });
    }

    return res.status(error.statusCode || 500).json({
      error: error.message,
    });
  }
}

async function login(req, res) {
  try {
    const data = loginSchema.parse(req.body);

    const result = await authService.login(data);

    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: error.issues[0].message,
      });
    }

    return res.status(error.statusCode || 500).json({
      error: error.message,
    });
  }
}

module.exports = { signUp, login };