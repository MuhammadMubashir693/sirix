import React, { useState } from 'react';
import { useDiagnostics, useRunDiagnosticTest } from '../hooks/useDiagnostics';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';

type TestResult =
  | { testType: string; status: 'success'; res: unknown }
  | { testType: string; status: 'error'; error: string };

export const DiagnosticsPage: React.FC = () => {
  const { data, isLoading, isError, refetch } = useDiagnostics();
  const runTestMutation = useRunDiagnosticTest();
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const handleTest = async (testType: string) => {
    try {
      const res = await runTestMutation.mutateAsync(testType);
      setTestResult({ testType, res, status: 'success' });
    } catch (err) {
      setTestResult({
        testType,
        error: err instanceof Error ? err.message : 'Test failed',
        status: 'error',
      });
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><LoadingSpinner /></div>;
  if (isError || !data) return <div className="p-6 text-center font-medium text-danger-500">Failed to retrieve diagnostics.</div>;

  const { services, system, responseTimeMs } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">System Diagnostics &amp; Health</h1>
          <p className="text-sm text-ink-500">Monitor system performance, ping latency, and process execution.</p>
        </div>
        <Button variant="secondary" onClick={() => refetch()}>Refresh Diagnostics</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-brand-500 p-5">
          <h3 className="font-semibold text-ink-700">MongoDB Database</h3>
          <div className="mt-3 flex items-center justify-between">
            <Badge variant={services.database.status === 'healthy' ? 'success' : 'danger'}>{services.database.status.toUpperCase()}</Badge>
            <span className="font-mono text-sm text-ink-700">{services.database.latencyMs} ms</span>
          </div>
        </Card>

        <Card className="border-l-4 border-l-success-500 p-5">
          <h3 className="font-semibold text-ink-700">Redis Cache</h3>
          <div className="mt-3 flex items-center justify-between">
            <Badge variant={services.redis.status === 'healthy' ? 'success' : 'danger'}>{services.redis.status.toUpperCase()}</Badge>
            <span className="font-mono text-sm text-ink-700">{services.redis.latencyMs} ms</span>
          </div>
        </Card>

        <Card className="border-l-4 border-l-brand-700 p-5">
          <h3 className="font-semibold text-ink-700">API Latency</h3>
          <div className="mt-3 flex items-center justify-between">
            <Badge variant="brand">HEALTHY</Badge>
            <span className="font-mono text-sm text-ink-700">{responseTimeMs} ms</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h2 className="mb-4 font-display text-lg font-semibold text-ink-900">Host System Resource Usage</h2>
          <div className="space-y-4 text-sm text-ink-700">
            <div>
              <div className="flex justify-between mb-1">
                <span>Memory Usage ({system.memory.usagePercentage}%)</span>
                <span>{(system.memory.usedBytes / (1024 ** 3)).toFixed(2)} GB / {(system.memory.totalBytes / (1024 ** 3)).toFixed(2)} GB</span>
              </div>
              <div className="h-2 w-full rounded-full bg-surface-hover">
                <div className="h-2 rounded-full bg-brand-600" style={{ width: `${Math.min(system.memory.usagePercentage, 100)}%` }}></div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 font-display text-lg font-semibold text-ink-900">Interactive Diagnostic Tests</h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => handleTest('db_ping')} disabled={runTestMutation.isPending}>Test DB Ping</Button>
            <Button variant="secondary" size="sm" onClick={() => handleTest('redis_ping')} disabled={runTestMutation.isPending}>Test Redis Ping</Button>
            <Button variant="secondary" size="sm" onClick={() => handleTest('memory_check')} disabled={runTestMutation.isPending}>Check Memory</Button>
          </div>
          {testResult && (
            <div className="mt-4 rounded-md bg-surface-muted p-3 font-mono text-xs text-ink-900">
              <pre>
                {JSON.stringify(
                  testResult.status === 'success' ? testResult.res : testResult.error,
                  null,
                  2
                )}
              </pre>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};