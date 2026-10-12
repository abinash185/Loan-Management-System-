import bcrypt from "bcryptjs";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { signToken } from "../utils/jwt";
import { User } from "../models/User";
import { ROLES } from "../types";
import { loginSchema, signupSchema } from "../validators/auth.validator";

const SALT_ROUNDS = 10;

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = signupSchema.parse(req.body);

  if (await User.exists({ email })) {
    throw ApiError.conflict("Email already registered");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ name, email, passwordHash, role: ROLES.BORROWER });

  const token = signToken({ id: user.id, role: user.role });
  res.status(201).json({
    success: true,
    data: { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await User.findOne({ email }).select("+passwordHash");
  // Same message dono cases mein, taaki email enumeration na ho sake
  const valid = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!user || !valid) throw ApiError.unauthorized("Invalid email or password");

  const token = signToken({ id: user.id, role: user.role });
  res.json({
    success: true,
    data: { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } },
  });
});

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw ApiError.unauthorized("User no longer exists");
  res.json({
    success: true,
    data: { user: { id: user.id, name: user.name, email: user.email, role: user.role } },
  });
});