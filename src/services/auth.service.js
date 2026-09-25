const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const SALT_ROUNDS = 10;

async function signup({ name, email, password }) {
  // 1. Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const error = new Error('Email already in use');
    error.statusCode = 409; // conflict
    throw error;
  }

  // 2. Hash the password — never store plaintext
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // 3. Create the user
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });

  // 4. Sign a JWT — payload contains only non-sensitive identifiers
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  // 5. Return token + safe user info (never the password hash)
  return {
    token,
    user: { id: user.id, name: user.name, email: user.email },
  };
}

async function login({ email, password }) {
  // 1. Find user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  // 2. Compare password against stored hash
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  // 3. Sign JWT
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email },
  };
}

module.exports = { signup, login };