export * from './auth';
export * from './admin';
export * from './accounting';
export * from './parties';

/** Normalized shape thrown by the API client for any failed request. */
export interface ApiClientError {
  message: string;
  statusCode: number;
  errors: Record<string, unknown> | null;
}
