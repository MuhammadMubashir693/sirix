const RefreshToken = require('../models/RefreshToken');

class RefreshTokenRepository {
  create(data) {
    return RefreshToken.create(data);
  }

  findByHash(tokenHash) {
    return RefreshToken.findOne({ tokenHash }).populate('user');
  }

  async revoke(tokenHash, replacedByTokenHash = null) {
    return RefreshToken.findOneAndUpdate(
      { tokenHash },
      { revoked: true, revokedAt: new Date(), replacedByTokenHash },
      { new: true }
    );
  }

  async revokeAllForUser(userId) {
    return RefreshToken.updateMany({ user: userId, revoked: false }, { revoked: true, revokedAt: new Date() });
  }
}

module.exports = new RefreshTokenRepository();
