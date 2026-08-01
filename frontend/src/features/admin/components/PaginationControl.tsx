import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PaginationMeta } from '@/types';

interface PaginationControlProps {
  pagination: PaginationMeta | undefined;
  onPageChange: (page: number) => void;
}

export function PaginationControl({ pagination, onPageChange }: PaginationControlProps) {
  if (!pagination || pagination.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-ink-500">
      <p>
        Page <span className="font-medium text-ink-900">{pagination.page}</span> of{' '}
        <span className="font-medium text-ink-900">{pagination.totalPages}</span> · {pagination.total} total
      </p>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={!pagination.hasPrevPage}
          onClick={() => onPageChange(pagination.page - 1)}
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={!pagination.hasNextPage}
          onClick={() => onPageChange(pagination.page + 1)}
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
