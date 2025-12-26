const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const jwtConfig = require('../config/jwt');
const { validate, userValidation } = require('../middleware/validator');
const { authLimiter } = require('../middleware/rateLimiter');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Register
router.post('/register', authLimiter, validate(userValidation.register), async (req, res, next) => {
  try {
    const { email, password, username } = req.body;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const existingUsername = await User.findByUsername(username);
    if (existingUsername) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password_hash, username });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');
    const refreshTokenDoc = await RefreshToken.create(user.id, ipAddress, userAgent);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      },
      token,
      refreshToken: refreshTokenDoc.token
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', authLimiter, validate(userValidation.login), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');
    const refreshTokenDoc = await RefreshToken.create(user.id, ipAddress, userAgent);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      },
      token,
      refreshToken: refreshTokenDoc.token
    });
  } catch (error) {
    next(error);
  }
});

// Refresh token
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    // Find and validate refresh token
    const refreshTokenDoc = await RefreshToken.findByToken(refreshToken);
    if (!refreshTokenDoc) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    const user = await User.findById(refreshTokenDoc.user_id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Generate new access token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    // Optionally rotate refresh token for security
    await RefreshToken.revoke(refreshToken);
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');
    const newRefreshTokenDoc = await RefreshToken.create(user.id, ipAddress, userAgent);

    res.json({ 
      token,
      refreshToken: newRefreshTokenDoc.token
    });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      created_at: user.created_at
    });
  } catch (error) {
    next(error);
  }
});

// Update current user
router.put('/me', authMiddleware, async (req, res, next) => {
  try {
    const { username, email, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if email is being changed and is already taken
    if (email && email !== user.email) {
      const existingEmail = await User.findByEmail(email);
      if (existingEmail) {
        return res.status(409).json({ error: 'Email already in use' });
      }
    }

    // Check if username is being changed and is already taken
    if (username && username !== user.username) {
      const existingUsername = await User.findByUsername(username);
      if (existingUsername) {
        return res.status(409).json({ error: 'Username already taken' });
      }
    }

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password required to set new password' });
      }

      const isValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValid) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters' });
      }

      const password_hash = await bcrypt.hash(newPassword, 10);
      await User.update(req.user.id, { username, email, password_hash });
    } else {
      await User.update(req.user.id, { username, email });
    }

    const updatedUser = await User.findById(req.user.id);

    res.json({
      id: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.username,
      created_at: updatedUser.created_at
    });
  } catch (error) {
    next(error);
  }
});

// Logout (revoke all refresh tokens)
router.post('/logout', authMiddleware, async (req, res, next) => {
  try {
    await RefreshToken.revokeAllForUser(req.user.id);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
