import { Request, Response } from 'express';
import { User } from '../models/User';
import { AppError } from '../utils/errorHandler';
import { generateToken } from '../utils/auth';
import asyncHandler from 'express-async-handler';

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password, preferences } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    throw new AppError('User already exists', 400);
  }

  const user = await User.create({
    username,
    email,
    password,
    preferences,
    carbonFootprint: 0,
    greenTokens: 0
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      preferences: user.preferences,
      carbonFootprint: user.carbonFootprint,
      greenTokens: user.greenTokens,
      token: generateToken(user)
    });
  } else {
    throw new AppError('Invalid user data', 400);
  }
});

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.comparePassword(password))) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      preferences: user.preferences,
      carbonFootprint: user.carbonFootprint,
      greenTokens: user.greenTokens,
      token: generateToken(user)
    });
  } else {
    throw new AppError('Invalid email or password', 401);
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      preferences: user.preferences,
      carbonFootprint: user.carbonFootprint,
      greenTokens: user.greenTokens
    });
  } else {
    throw new AppError('User not found', 404);
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const user = await User.findById(req.user._id);

  if (user) {
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.preferences = req.body.preferences || user.preferences;
    
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      preferences: updatedUser.preferences,
      carbonFootprint: updatedUser.carbonFootprint,
      greenTokens: updatedUser.greenTokens,
      token: generateToken(updatedUser)
    });
  } else {
    throw new AppError('User not found', 404);
  }
});
