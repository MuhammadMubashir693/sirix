import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { FormField } from '@/components/forms/FormField';
import { PasswordInput } from '@/components/forms/PasswordInput';
import { Button } from '@/components/ui/button';
import { changePasswordSchema, type ChangePasswordFormValues } from '@/features/auth/schemas';
import { useChangePassword } from '@/features/auth/hooks/useAuth';

export default function ChangePasswordPage() {
  const changePasswordMutation = useChangePassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = (values: ChangePasswordFormValues) => {
    changePasswordMutation.mutate(
      { currentPassword: values.currentPassword, newPassword: values.newPassword },
      { onSuccess: () => reset() }
    );
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Change password</h1>
        <p className="mt-1 text-sm text-ink-500">Update the password used to sign in to Sirix.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <KeyRound className="size-5" />
              </div>
              <div>
                <CardTitle>Password</CardTitle>
                <CardDescription>Choose a strong password you don't use elsewhere.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <FormField
              label="Current password"
              htmlFor="currentPassword"
              error={errors.currentPassword?.message}
              required
            >
              <PasswordInput
                id="currentPassword"
                autoComplete="current-password"
                invalid={!!errors.currentPassword}
                {...register('currentPassword')}
              />
            </FormField>

            <FormField
              label="New password"
              htmlFor="newPassword"
              error={errors.newPassword?.message}
              hint="At least 8 characters, with an uppercase letter, lowercase letter, and number."
              required
            >
              <PasswordInput
                id="newPassword"
                autoComplete="new-password"
                invalid={!!errors.newPassword}
                {...register('newPassword')}
              />
            </FormField>

            <FormField
              label="Confirm new password"
              htmlFor="confirmPassword"
              error={errors.confirmPassword?.message}
              required
            >
              <PasswordInput
                id="confirmPassword"
                autoComplete="new-password"
                invalid={!!errors.confirmPassword}
                {...register('confirmPassword')}
              />
            </FormField>
          </CardContent>
          <CardFooter className="justify-end gap-3 border-t border-border pt-6">
            <Button type="submit" loading={changePasswordMutation.isPending}>
              Update password
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
