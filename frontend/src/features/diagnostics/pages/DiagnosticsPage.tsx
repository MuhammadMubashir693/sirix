import React, { useState } from 'react';
import { useDiagnostics, useRunDiagnosticTest } from '../hooks/useDiagnostics';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';

export const DiagnosticsPage: React.FC = () => {
  const { data, isLoading, isError, refetch } = useDiagnostics();
  const runTestMutation = useRunDiagnosticTest();
  const [testResult, setTestResult] = useState<any>(null);

  const handleTest = async (testType: string) => {
    try {
      const res = await runTestMutation.mutateAsync(testType);
      setTestResult({ testType, res, status: 'success' });
    } catch (err: any) {
      setTestResult({ testType, error: err?.message || 'Test failed', status: 'error' });
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><LoadingSpinner /></div>;
  if (isError || !data) return <div className="p-6 text-center text-red-500 font-medium">Failed to retrieve diagnostics.</div>;

  const { services, system, responseTimeMs } = data;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Diagnostics & Health</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Monitor system performance, ping latency, and process execution.</p>
        </div>
        <Button variant="secondary" onClick={() => refetch()}>Refresh Diagnostics</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-5 border-l-4 border-l-indigo-500">
          <h3 className="font-semibold text-gray-700 dark:text-gray-200">MongoDB Database</h3>
          <div className="mt-3 flex items-center justify-between">
            <Badge variant={services.database.status === 'healthy' ? 'success' : 'danger'}>{services.database.status.toUpperCase()}</Badge>
            <span className="text-sm font-mono text-gray-600 dark:text-gray-300">{services.database.latencyMs} ms</span>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-emerald-500">
          <h3 className="font-semibold text-gray-700 dark:text-gray-200">Redis Cache</h3>
          <div className="mt-3 flex items-center justify-between">
            <Badge variant={services.redis.status === 'healthy' ? 'success' : 'danger'}>{services.redis.status.toUpperCase()}</Badge>
            <span className="text-sm font-mono text-gray-600 dark:text-gray-300">{services.redis.latencyMs} ms</span>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-blue-500">
          <h3 className="font-semibold text-gray-700 dark:text-gray-200">API Latency</h3>
          <div className="mt-3 flex items-center justify-between">
            <Badge variant="brand">HEALTHY</Badge>
            <span className="text-sm font-mono text-gray-600 dark:text-gray-300">{responseTimeMs} ms</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Host System Resource Usage</h2>
          <div className="space-y-4 text-sm">
            <div>
              <div className="flex justify-between mb-1">
                <span>Memory Usage ({system.memory.usagePercentage}%)</span>
                <span>{(system.memory.usedBytes / (1024 ** 3)).toFixed(2)} GB / {(system.memory.totalBytes / (1024 ** 3)).toFixed(2)} GB</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${Math.min(system.memory.usagePercentage, 100)}%` }}></div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Interactive Diagnostic Tests</h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => handleTest('db_ping')} disabled={runTestMutation.isPending}>Test DB Ping</Button>
            <Button variant="secondary" size="sm" onClick={() => handleTest('redis_ping')} disabled={runTestMutation.isPending}>Test Redis Ping</Button>
            <Button variant="secondary" size="sm" onClick={() => handleTest('memory_check')} disabled={runTestMutation.isPending}>Check Memory</Button>
          </div>
          {testResult && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-xs font-mono">
              <pre>{JSON.stringify(testResult.res || testResult.error, null, 2)}</pre>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};