import { apiRequest, apiRequestFull } from '@/lib/apiClient';
import type { Party, PartyPayload, PartyType, ListPartiesParams, PartyListResult } from '@/types/parties';

export const partiesApi = {
  list: async (type: PartyType, params: ListPartiesParams = {}) => {
    const res = await apiRequestFull<Party[]>({ method: 'GET', url: `/${type}`, params });
    return { items: res.data ?? [], pagination: res.pagination! } as PartyListResult;
  },

  getById: (type: PartyType, id: string) => apiRequest<Party>({ method: 'GET', url: `/${type}/${id}` }),

  create: (type: PartyType, payload: PartyPayload) =>
    apiRequest<Party>({ method: 'POST', url: `/${type}`, data: payload }),

  update: (type: PartyType, id: string, payload: Partial<PartyPayload>) =>
    apiRequest<Party>({ method: 'PUT', url: `/${type}/${id}`, data: payload }),

  remove: (type: PartyType, id: string) => apiRequest<null>({ method: 'DELETE', url: `/${type}/${id}` }),
};
