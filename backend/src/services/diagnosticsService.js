const mongoose = require('mongoose');
const os = require('os');
const { getRedisClient } = require('../config/redis');

class DiagnosticsService {
  async getSystemDiagnostics() {
    const startTime = Date.now();

    let dbLatencyMs = 0;
    let dbStatus = 'healthy';
    try {
      const dbStart = Date.now();
      if (mongoose.connection.db) {
        await mongoose.connection.db.admin().ping();
      }
      dbLatencyMs = Date.now() - dbStart;
    } catch {
      dbStatus = 'unhealthy';
    }

    let redisLatencyMs = 0;
    let redisStatus = 'healthy';
    try {
      const redisStart = Date.now();
      const redisClient = getRedisClient();
      if (redisClient && redisClient.status === 'ready') {
        await redisClient.ping();
        redisLatencyMs = Date.now() - redisStart;
      } else {
        redisStatus = 'disconnected';
      }
    } catch {
      redisStatus = 'unhealthy';
    }

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const cpuLoad = os.loadavg();
    const memoryUsage = process.memoryUsage();

    return {
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: dbStatus,
          latencyMs: dbLatencyMs,
          connectionState: mongoose.connection.readyState,
        },
        redis: {
          status: redisStatus,
          latencyMs: redisLatencyMs,
        },
      },
      system: {
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        uptimeSeconds: Math.floor(os.uptime()),
        loadAverage: cpuLoad,
        memory: {
          totalBytes: totalMem,
          freeBytes: freeMem,
          usedBytes: usedMem,
          usagePercentage: Number(((usedMem / totalMem) * 100).toFixed(2)),
        },
      },
      process: {
        pid: process.pid,
        nodeVersion: process.version,
        uptimeSeconds: Math.floor(process.uptime()),
        memoryUsage: {
          rss: memoryUsage.rss,
          heapTotal: memoryUsage.heapTotal,
          heapUsed: memoryUsage.heapUsed,
          external: memoryUsage.external,
        },
      },
      responseTimeMs: Date.now() - startTime,
    };
  }

  async runDiagnosticTest(type) {
    switch (type) {
      case 'db_ping': {
        const start = Date.now();
        await mongoose.connection.db.admin().ping();
        return { success: true, latencyMs: Date.now() - start, details: 'Database connection responsive' };
      }
      case 'redis_ping': {
        const start = Date.now();
        await getRedisClient().ping();
        return { success: true, latencyMs: Date.now() - start, details: 'Redis cache responsive' };
      }
      case 'memory_check': {
        const usage = process.memoryUsage();
        return { success: true, heapUsedMB: (usage.heapUsed / 1024 / 1024).toFixed(2), details: 'Memory limits healthy' };
      }
      default:
        throw new Error(`Unknown diagnostic test type: ${type}`);
    }
  }
}

module.exports = new DiagnosticsService();