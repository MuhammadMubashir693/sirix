const BaseRepository = require('./BaseRepository');
const User = require('../models/User');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  findByEmail(email, { withPassword = false } = {}) {
    const query = this.model.findOne({ email: email.toLowerCase() });
    if (withPassword) query.select('+password');
    return query.populate({ path: 'role', populate: { path: 'permissions' } });
  }

  findByIdWithRole(id) {
    return this.model.findById(id).populate({ path: 'role', populate: { path: 'permissions' } });
  }

  findByResetToken(hashedToken) {
    return this.model
      .findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } })
      .select('+password +passwordResetToken +passwordResetExpires');
  }
}

module.exports = new UserRepository();
