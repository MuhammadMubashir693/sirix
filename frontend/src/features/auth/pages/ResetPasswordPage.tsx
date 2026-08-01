import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import { AuthLayout } from '@/layouts/AuthLayout';
import { FormField } from '@/components/forms/FormField';
import { PasswordInput } from '@/components/forms/PasswordInput';
import { Button } from '@/components/ui/button';
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/features/auth/schemas';
import { useResetPassword } from '@/features/auth/hooks/useAuth';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const resetPasswordMutation = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const onSubmit = (values: ResetPasswordFormValues) => {
    if (!token) return;
    resetPasswordMutation.mutate(
      { token, newPassword: values.newPassword },
      { onSuccess: () => navigate('/login', { replace: true }) }
    );
  };

  if (!token) {
    return (
      <AuthLayout
        eyebrow="Account recovery"
        title="Every carrier relationship, in one signal."
        description="Monitor traffic, reconcile revenue, and manage relationships from a single control plane."
      >
        <div className="space-y-5 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-danger-100 text-danger-500">
            <AlertCircle className="size-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="font-display text-2xl font-semibold text-ink-900">Link is invalid</h2>
            <p className="text-sm text-ink-500">
              This password reset link is missing its token. Request a new link and try again.
            </p>
          </div>
          <Button asChild className="w-full">
            <Link to="/forgot-password">Request a new link</Link>
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="Account recovery"
      title="Set a new password."
      description="Choose something strong you haven't used before. You'll be signed out of all other sessions."
    >
      <div className="mb-8 space-y-1.5">
        <h2 className="font-display text-2xl font-semibold text-ink-900">Reset password</h2>
        <p className="text-sm text-ink-500">Enter and confirm your new password.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
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

        <Button type="submit" className="w-full" loading={resetPasswordMutation.isPending}>
          Reset password
        </Button>
      </form>
    </AuthLayout>
  );
}
