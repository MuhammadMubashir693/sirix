import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, MailCheck } from 'lucide-react';
import { AuthLayout } from '@/layouts/AuthLayout';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/features/auth/schemas';
import { useForgotPassword } from '@/features/auth/hooks/useAuth';

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const forgotPasswordMutation = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = (values: ForgotPasswordFormValues) => {
    forgotPasswordMutation.mutate(values, { onSuccess: () => setSubmitted(true) });
  };

  return (
    <AuthLayout
      eyebrow="Account recovery"
      title="Regain access in a few steps."
      description="We'll send a secure, time-limited link to your inbox so you can set a new password."
    >
      {submitted ? (
        <div className="space-y-5 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <MailCheck className="size-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="font-display text-2xl font-semibold text-ink-900">Check your email</h2>
            <p className="text-sm text-ink-500">
              If an account exists for that address, we've sent a link to reset your password. It expires in 1
              hour.
            </p>
          </div>
          <Button variant="secondary" asChild className="w-full">
            <Link to="/login">
              <ArrowLeft />
              Back to sign in
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-8 space-y-1.5">
            <h2 className="font-display text-2xl font-semibold text-ink-900">Forgot your password?</h2>
            <p className="text-sm text-ink-500">Enter the email associated with your account.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <FormField label="Email address" htmlFor="email" error={errors.email?.message} required>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                invalid={!!errors.email}
                {...register('email')}
              />
            </FormField>

            <Button type="submit" className="w-full" loading={forgotPasswordMutation.isPending}>
              Send reset link
            </Button>

            <Link
              to="/login"
              className="flex items-center justify-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900"
            >
              <ArrowLeft className="size-4" />
              Back to sign in
            </Link>
          </form>
        </>
      )}
    </AuthLayout>
  );
}
