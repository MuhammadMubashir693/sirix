import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { partiesApi } from '@/api/parties';
import type { PartyPayload, PartyType, ListPartiesParams } from '@/types/parties';
import type { ApiClientError } from '@/types';

const LABELS: Record<PartyType, string> = { customers: 'Customer', carriers: 'Carrier', vendors: 'Vendor' };

const partiesKey = (type: PartyType) => ['accounting', type];

function onErrorToast(error: ApiClientError) {
  toast.error(error.message || 'An error occurred');
}

export function useParties(type: PartyType, params: ListPartiesParams = {}) {
  return useQuery({
    queryKey: [...partiesKey(type), params],
    queryFn: () => partiesApi.list(type, params),
    placeholderData: (previous) => previous,
  });
}

export function useCreateParty(type: PartyType) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PartyPayload) => partiesApi.create(type, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partiesKey(type) });
      toast.success(`${LABELS[type]} created successfully`);
    },
    onError: onErrorToast,
  });
}

export function useUpdateParty(type: PartyType) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<PartyPayload> }) =>
      partiesApi.update(type, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partiesKey(type) });
      toast.success(`${LABELS[type]} updated successfully`);
    },
    onError: onErrorToast,
  });
}

export function useDeleteParty(type: PartyType) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => partiesApi.remove(type, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partiesKey(type) });
      toast.success(`${LABELS[type]} deleted successfully`);
    },
    onError: onErrorToast,
  });
}
