import type { PaginationMeta } from './auth';

/** Customers, carriers and vendors: the counterparties invoices and payments reference. */
export type PartyType = 'customers' | 'carriers' | 'vendors';
export type PartyStatus = 'active' | 'inactive' | 'suspended';

export interface Party {
  _id: string;
  name: string;
  /** Required on customers, optional on carriers and vendors. */
  email?: string;
  /** Carriers and vendors are keyed by a short code instead of an email. */
  code?: string;
  phone?: string;
  company?: string;
  status: PartyStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PartyPayload {
  name: string;
  email?: string;
  code?: string;
  phone?: string;
  company?: string;
  status?: PartyStatus;
  notes?: string;
}

export interface ListPartiesParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  status?: PartyStatus;
}

export interface PartyListResult {
  items: Party[];
  pagination: PaginationMeta;
}
