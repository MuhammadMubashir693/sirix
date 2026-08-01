import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { FormField } from '@/components/forms/FormField';
import { PasswordInput } from '@/components/forms/PasswordInput';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { createUserSchema, updateUserSchema, type CreateUserFormValues, type UpdateUserFormValues } from '@/features/admin/schemas';
import { useCreateAdminUser, useUpdateAdminUser } from '@/features/admin/hooks/useAdminUsers';
import { useRoles } from '@/features/admin/hooks/useRoles';
import type { User } from '@/types';

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
}

export function UserFormDialog({ open, onOpenChange, user }: UserFormDialogProps) {
  const isEditing = !!user;
  const { data: roles } = useRoles();
  const createMutation = useCreateAdminUser();
  const updateMutation = useUpdateAdminUser();

  const form = useForm<CreateUserFormValues | UpdateUserFormValues>({
    resolver: zodResolver(isEditing ? updateUserSchema : createUserSchema),
    defaultValues: { firstName: '', lastName: '', email: '', roleId: '', phone: '' },
  });

  useEffect(() => {
    if (open) {
      form.reset(
        user
          ? { firstName: user.firstName, lastName: user.lastName, email: user.email, roleId: user.role._id, phone: user.phone ?? '' }
          : { firstName: '', lastName: '', email: '', password: '', roleId: '', phone: '' }
      );
    }
  }, [open, user, form]);

  const onSubmit = (values: CreateUserFormValues | UpdateUserFormValues) => {
    if (isEditing && user) {
      updateMutation.mutate(
        { id: user._id, payload: values },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createMutation.mutate(values as CreateUserFormValues, { onSuccess: () => onOpenChange(false) });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const errors = form.formState.errors as Record<string, { message?: string } | undefined>;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit user' : 'Create user'}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update this user's details and role." : 'Add a new user and assign them a role.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="First name" htmlFor="firstName" error={errors.firstName?.message} required>
              <Input id="firstName" invalid={!!errors.firstName} {...form.register('firstName')} />
            </FormField>
            <FormField label="Last name" htmlFor="lastName" error={errors.lastName?.message} required>
              <Input id="lastName" invalid={!!errors.lastName} {...form.register('lastName')} />
            </FormField>
          </div>

          <FormField label="Email address" htmlFor="email" error={errors.email?.message} required>
            <Input id="email" type="email" invalid={!!errors.email} {...form.register('email')} />
          </FormField>

          {!isEditing && (
            <FormField label="Password" htmlFor="password" error={errors.password?.message} required>
              <PasswordInput
                id="password"
                invalid={!!errors.password}
                {...form.register('password' as keyof CreateUserFormValues)}
              />
            </FormField>
          )}

          <FormField label="Role" htmlFor="roleId" error={errors.roleId?.message} required>
            <Select
              value={form.watch('roleId')}
              onValueChange={(value) => form.setValue('roleId', value, { shouldValidate: true })}
            >
              <SelectTrigger id="roleId" invalid={!!errors.roleId}>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles?.map((role) => (
                  <SelectItem key={role._id} value={role._id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Phone" htmlFor="phone" hint="Optional">
            <Input id="phone" {...form.register('phone')} />
          </FormField>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" loading={isPending}>
              {isEditing ? 'Save changes' : 'Create user'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
