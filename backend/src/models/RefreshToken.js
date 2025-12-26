const db = require('../config/database');
const crypto = require('crypto');

class RefreshToken {
  static async create(userId, ipAddress, userAgent) {
    const token = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    const [refreshToken] = await db('refresh_tokens')
      .insert({
        user_id: userId,
        token,
        expires_at: expiresAt,
        ip_address: ipAddress,
        user_agent: userAgent
      })
      .returning('*');

    return refreshToken;
  }

  static async findByToken(token) {
    return await db('refresh_tokens')
      .where({ token, revoked: false })
      .where('expires_at', '>', new Date())
      .first();
  }

  static async revoke(token) {
    await db('refresh_tokens')
      .where({ token })
      .update({
        revoked: true,
        revoked_at: new Date()
      });
  }

  static async revokeAllForUser(userId) {
    await db('refresh_tokens')
      .where({ user_id: userId })
      .update({
        revoked: true,
        revoked_at: new Date()
      });
  }

  static async deleteExpired() {
    await db('refresh_tokens')
      .where('expires_at', '<', new Date())
      .delete();
  }

  static async deleteForUser(userId) {
    await db('refresh_tokens')
      .where({ user_id: userId })
      .delete();
  }
}

module.exports = RefreshToken;
