import { apiClient } from '../lib/apiClient';

export interface DiagnosticsData {
  timestamp: string;
  services: {
    database: { status: string; latencyMs: number; connectionState: number };
    redis: { status: string; latencyMs: number };
  };
  system: {
    platform: string;
    arch: string;
    cpus: number;
    uptimeSeconds: number;
    loadAverage: number[];
    memory: { totalBytes: number; freeBytes: number; usedBytes: number; usagePercentage: number };
  };
  process: {
    pid: number;
    nodeVersion: string;
    uptimeSeconds: number;
    memoryUsage: { rss: number; heapTotal: number; heapUsed: number; external: number };
  };
  responseTimeMs: number;
}

export const fetchDiagnostics = async (): Promise<DiagnosticsData> => {
  const response = await apiClient.get('/diagnostics');
  return response.data.data;
};

export const executeDiagnosticTest = async (testType: string) => {
  const response = await apiClient.post('/diagnostics/run-test', { testType });
  return response.data.data;
};