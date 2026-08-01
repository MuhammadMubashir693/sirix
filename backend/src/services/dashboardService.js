const User = require('../models/User');
const Role = require('../models/Role');
const AuditLog = require('../models/AuditLog');
const RefreshToken = require('../models/RefreshToken');
const mongoose = require('mongoose');
const redisClient = require('../config/redis');

class DashboardService {
  async getMetrics() {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const totalRoles = await Role.countDocuments();

    const activeSessions = await RefreshToken.countDocuments({
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    });

    const recentAuditLogs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'username email');

    const roleDistribution = await User.aggregate([
      { $unwind: '$roles' },
      { $group: { _id: '$roles', count: { $sum: 1 } } },
      {
        $lookup: {
          from: 'roles',
          localField: '_id',
          foreignField: '_id',
          as: 'roleInfo',
        },
      },
      { $unwind: '$roleInfo' },
      { $project: { roleName: '$roleInfo.name', count: 1 } },
    ]);

    let redisStatus = 'healthy';
    try {
      if (redisClient && redisClient.isOpen) {
        await redisClient.ping();
      } else {
        redisStatus = 'degraded';
      }
    } catch {
      redisStatus = 'unhealthy';
    }

    const dbStatus = mongoose.connection.readyState === 1 ? 'healthy' : 'unhealthy';

    return {
      summary: {
        totalUsers,
        activeUsers,
        totalRoles,
        activeSessions,
      },
      systemHealth: {
        database: dbStatus,
        redis: redisStatus,
        uptime: process.uptime(),
      },
      roleDistribution,
      recentAuditLogs,
    };
  }
}

module.exports = new DashboardService();